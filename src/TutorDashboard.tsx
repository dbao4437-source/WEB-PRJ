import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  RefreshCw,
  Save,
  Search,
  Star,
  Target,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import './TutorDashboard.css';

type LessonSession = {
  lessonDate: string;
  completedAt?: string | null;
  rating?: number;
  feedback?: string;
};

type TutorEnrollment = {
  _id: string;
  studentId: string;
  studentName: string;
  grade: string;
  subject: string;
  className: string;
  dayOfWeek?: number;
  startTime?: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  durationMinutes?: number;
  meetingLink?: string;
  curriculumLink?: string;
  enrolledAt?: string;
  status: 'pending' | 'active' | 'rejected';
  sessions?: LessonSession[];
};

type TutorProfile = {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  gender: string;
  birthYear: number | null;
  region: string;
  city: string;
  educationLevel: string;
  institution: string;
  major: string;
  title: string;
  subjectsTaught: string[];
  pricePer25Min: number;
  bio: string;
};

type TutorDashboardData = {
  profile: TutorProfile;
  enrollments: TutorEnrollment[];
};

type WeekDay = {
  key: string;
  day: number;
  date: string;
  label: string;
};

type WeekView = {
  days: WeekDay[];
  rangeLabel: string;
};

type HistoryItem = {
  enrollment: TutorEnrollment;
  session: LessonSession;
};

const dayLabels = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const regions = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];
const educationLevels = ['THPT', 'Cao đẳng', 'Đại học', 'Thạc sĩ', 'Tiến sĩ'];
const maxTutorBirthYear = new Date().getFullYear() - 15;
const teachingSubjectGroups = [
  {
    title: 'Ngoại ngữ',
    subjects: ['Tiếng Anh giao tiếp', 'Tiếng Anh trẻ em', 'IELTS', 'TOEIC', 'TOEFL', 'Tiếng Trung (HSK)', 'Tiếng Nhật (JLPT)', 'Tiếng Hàn (TOPIK)'],
  },
  {
    title: 'Văn hóa & học thuật',
    subjects: ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Lịch sử', 'Địa lý', 'Tin học'],
  },
];
const presetTeachingSubjects = new Set(teachingSubjectGroups.flatMap((group) => group.subjects));
const timeSlots = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  const minute = index % 2 === 0 ? '00' : '30';
  return { time: `${hour}:${minute}`, minutes: index * 30 };
});

const getLocalDateKey = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};

const getZonedDateKey = (date: Date, timeZone = 'Asia/Ho_Chi_Minh') => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const getLatestScheduledDate = (enrollment: TutorEnrollment, today: Date) => {
  if (!Number.isInteger(enrollment.dayOfWeek)) return '';
  const date = new Date(`${getZonedDateKey(today, enrollment.timeZone)}T12:00:00Z`);
  for (let daysBack = 0; daysBack < 370; daysBack += 1) {
    const candidate = new Date(date);
    candidate.setUTCDate(date.getUTCDate() - daysBack);
    const dateKey = candidate.toISOString().slice(0, 10);
    if (candidate.getUTCDay() === enrollment.dayOfWeek
      && (!enrollment.startDate || dateKey >= enrollment.startDate)
      && (!enrollment.endDate || dateKey <= enrollment.endDate)) {
      return dateKey;
    }
  }
  return '';
};

const getNextScheduledDate = (enrollment: TutorEnrollment, now: Date) => {
  const dayOfWeek = enrollment.dayOfWeek;
  if (typeof dayOfWeek !== 'number' || !Number.isInteger(dayOfWeek) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(enrollment.startTime || '')) return '';
  const timeZone = enrollment.timeZone || 'Asia/Ho_Chi_Minh';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const todayKey = `${values.year}-${values.month}-${values.day}`;
  const currentTime = `${values.hour}:${values.minute}`;
  const startKey = enrollment.startDate && enrollment.startDate > todayKey
    ? enrollment.startDate
    : todayKey;
  const candidate = new Date(`${startKey}T12:00:00Z`);
  candidate.setUTCDate(candidate.getUTCDate() + ((dayOfWeek - candidate.getUTCDay() + 7) % 7));
  if (startKey === todayKey && candidate.toISOString().slice(0, 10) === todayKey && enrollment.startTime! <= currentTime) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
  }
  const candidateKey = candidate.toISOString().slice(0, 10);
  if (enrollment.endDate && candidateKey > enrollment.endDate) return '';
  return candidateKey;
};

const getWeekOffsetForDate = (dateKey: string) => {
  const target = new Date(`${dateKey}T12:00:00`);
  const targetMonday = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  targetMonday.setDate(targetMonday.getDate() - ((targetMonday.getDay() + 6) % 7));
  const today = new Date();
  const currentMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  currentMonday.setDate(currentMonday.getDate() - ((currentMonday.getDay() + 6) % 7));
  return Math.round((targetMonday.getTime() - currentMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
};

const buildWeek = (offset: number): WeekView => {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      key: getLocalDateKey(date),
      day: date.getDay(),
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      label: dayLabels[date.getDay()],
    };
  });
  return {
    days,
    rangeLabel: `${days[0].date} – ${days[6].date}`,
  };
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const emptyProfile: TutorProfile = {
  fullName: '',
  email: '',
  phone: '',
  avatar: '',
  gender: '',
  birthYear: null,
  region: '',
  city: '',
  educationLevel: '',
  institution: '',
  major: '',
  title: '',
  subjectsTaught: [],
  pricePer25Min: 0,
  bio: '',
};

const readApiResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLocaleLowerCase().includes('application/json')) {
    throw new Error(response.status === 404
      ? 'Không tìm thấy API gia sư. Hãy khởi động lại backend để nạp các tuyến API mới.'
      : 'Backend trả về HTML thay vì JSON. Hãy kiểm tra và khởi động lại backend.');
  }
  return response.json();
};

const formatCurrency = (amount: number) => `VND ${Math.round(amount).toLocaleString('vi-VN')}`;

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<TutorProfile>(emptyProfile);
  const [enrollments, setEnrollments] = useState<TutorEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [subjectsInput, setSubjectsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [processingId, setProcessingId] = useState('');
  const [sessionDates, setSessionDates] = useState<Record<string, string>>({});
  const [latestSessionDates, setLatestSessionDates] = useState<Record<string, string>>({});
  const [todayDateKeys, setTodayDateKeys] = useState<Record<string, string>>({});
  const [reportEnrollment, setReportEnrollment] = useState<TutorEnrollment | null>(null);
  const [reportDate, setReportDate] = useState('');
  const [reportRating, setReportRating] = useState(5);
  const [reportFeedback, setReportFeedback] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [announcementExpanded, setAnnouncementExpanded] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [week, setWeek] = useState<WeekView>(() => buildWeek(0));
  const [scheduleNow] = useState(() => new Date());
  const [timeRange, setTimeRange] = useState('all');
  const [historyMonth, setHistoryMonth] = useState(getCurrentMonthKey);

  useEffect(() => {
    const controller = new AbortController();
    const loadDashboard = async () => {
      setLoading(true);
      setLoadError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/tutor/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await readApiResponse(response);
        if (!response.ok) throw new Error(result.message || 'Không thể tải dữ liệu gia sư');
        const data = result.data as TutorDashboardData;
        const loadedProfile = { ...emptyProfile, ...data.profile };
        const loadedEnrollments = Array.isArray(data.enrollments) ? data.enrollments : [];
        const today = new Date();
        setProfile(loadedProfile);
        setSubjectsInput(loadedProfile.subjectsTaught.join(', '));
        setEnrollments(loadedEnrollments);
        setTodayDateKeys(Object.fromEntries(loadedEnrollments.map((item) => [
          item._id,
          getZonedDateKey(today, item.timeZone),
        ])));
        setLatestSessionDates(Object.fromEntries(loadedEnrollments.map((item) => [
          item._id,
          getLatestScheduledDate(item, today),
        ])));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setLoadError(error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadDashboard();
    return () => controller.abort();
  }, [refreshKey]);

  const pendingEnrollments = enrollments.filter((item) => item.status === 'pending');
  const activeEnrollments = enrollments.filter((item) => item.status === 'active');
  const uniqueStudentCount = new Set(activeEnrollments.map((item) => item.studentId)).size;
  const historyItems = useMemo<HistoryItem[]>(() => enrollments
    .flatMap((enrollment) => (enrollment.sessions || [])
      .filter((session) => session.completedAt)
      .map((session) => ({ enrollment, session })))
    .sort((a, b) => b.session.lessonDate.localeCompare(a.session.lessonDate)), [enrollments]);
  const monthHistory = historyItems.filter((item) => item.session.lessonDate.startsWith(historyMonth));
  const historyMinutes = monthHistory.reduce((total, item) => total + (item.enrollment.durationMinutes || 90), 0);
  const historyEstimate = profile.pricePer25Min > 0
    ? monthHistory.reduce((total, item) => total + ((item.enrollment.durationMinutes || 90) / 25) * profile.pricePer25Min, 0)
    : 0;
  const profileFields = [
    profile.fullName,
    profile.phone,
    profile.gender,
    profile.birthYear,
    profile.region,
    profile.city,
    profile.educationLevel,
    profile.institution,
    profile.major,
    profile.title,
    subjectsInput.trim(),
    profile.bio,
  ];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
  const selectedTeachingSubjects = subjectsInput.split(',').map((subject) => subject.trim()).filter(Boolean);
  const customTeachingSubjects = selectedTeachingSubjects.filter((subject) => !presetTeachingSubjects.has(subject));
  const filteredRequests = pendingEnrollments.filter((item) => {
    const query = requestSearch.trim().toLocaleLowerCase('vi-VN');
    return !query || [item.studentName, item.subject, item.grade, item.className]
      .some((value) => value?.toLocaleLowerCase('vi-VN').includes(query));
  });

  const handleLogout = () => {
    ['token', 'role', 'userId', 'userName', 'userEmail'].forEach((key) => localStorage.removeItem(key));
    navigate('/login');
  };

  const handleRefresh = () => setRefreshKey((current) => current + 1);

  const toggleTeachingSubject = (subject: string, checked: boolean) => {
    const subjects = selectedTeachingSubjects.filter((item) => item !== subject);
    if (checked) subjects.push(subject);
    setSubjectsInput(subjects.join(', '));
  };

  const updateCustomSubjects = (value: string) => {
    const presetSubjects = selectedTeachingSubjects.filter((subject) => presetTeachingSubjects.has(subject));
    const customSubjects = value.split(',').map((subject) => subject.trim()).filter(Boolean);
    setSubjectsInput([...presetSubjects, ...customSubjects].join(', '));
  };

  const handleWeekChange = (offset: number) => {
    const nextOffset = weekOffset + offset;
    setWeekOffset(nextOffset);
    setWeek(buildWeek(nextOffset));
  };

  const handleMonthChange = (offset: number) => {
    const [year, month] = historyMonth.split('-').map(Number);
    const nextMonth = new Date(year, month - 1 + offset, 1);
    setHistoryMonth(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setIsProfileSaved(false);
    setProfileError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fullName: profile.fullName.trim(),
          phone: profile.phone.trim(),
          gender: profile.gender,
          birthYear: profile.birthYear,
          region: profile.region,
          city: profile.city.trim(),
          educationLevel: profile.educationLevel,
          institution: profile.institution.trim(),
          major: profile.major.trim(),
          title: profile.title.trim(),
          subjectsTaught: subjectsInput.split(',').map((subject) => subject.trim()).filter(Boolean),
          pricePer25Min: Number(profile.pricePer25Min) || 0,
          bio: profile.bio.trim(),
        }),
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || 'Không thể cập nhật hồ sơ gia sư');
      const savedProfile = { ...profile, ...result.data, subjectsTaught: result.data.subjectsTaught || [] };
      setProfile(savedProfile);
      setSubjectsInput(savedProfile.subjectsTaught.join(', '));
      localStorage.setItem('userName', savedProfile.fullName);
      setIsProfileSaved(true);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnrollmentDecision = async (enrollment: TutorEnrollment, status: 'active' | 'rejected') => {
    if (status === 'rejected' && !window.confirm(`Từ chối yêu cầu học của ${enrollment.studentName}?`)) return;
    setProcessingId(enrollment._id);
    setRequestError('');
    setRequestMessage('');
    try {
      const response = await fetch(`http://localhost:5000/api/auth/tutor/students/${enrollment.studentId}/enrollments/${enrollment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || 'Không thể xử lý yêu cầu học');
      setEnrollments((current) => current.map((item) => item._id === enrollment._id ? { ...item, status } : item));
      setRequestMessage(status === 'active'
        ? `Đã nhận học viên ${enrollment.studentName}.`
        : `Đã từ chối yêu cầu của ${enrollment.studentName}.`);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ');
    } finally {
      setProcessingId('');
    }
  };

  const handleCompleteLesson = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reportEnrollment || !reportDate) return;
    setIsSubmittingReport(true);
    setReportError('');
    setReportMessage('');
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/tutor/students/${reportEnrollment.studentId}/enrollments/${reportEnrollment._id}/sessions/${reportDate}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ rating: reportRating, feedback: reportFeedback.trim() }),
        }
      );
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || 'Không thể lưu đánh giá buổi học');
      setReportMessage(`Đã hoàn tất và đánh giá buổi học ngày ${reportDate}. Học viên sẽ nhận được thông báo.`);
      setReportEnrollment(null);
      setReportFeedback('');
      handleRefresh();
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const openLessonReport = (enrollment: TutorEnrollment) => {
    const date = sessionDates[enrollment._id] ?? latestSessionDates[enrollment._id] ?? '';
    if (!date) return;
    setReportEnrollment(enrollment);
    setReportDate(date);
    setReportRating(5);
    setReportFeedback('');
    setReportError('');
  };

  const renderEnrollmentCard = (enrollment: TutorEnrollment, isRequest = false) => {
    const sessionDate = sessionDates[enrollment._id] ?? latestSessionDates[enrollment._id] ?? '';
    const completedSession = enrollment.sessions?.find((session) => session.lessonDate === sessionDate && session.completedAt);
    return (
      <article className="tutor-enrollment-card" key={enrollment._id}>
        <div className="tutor-enrollment-heading">
          <div className="tutor-student-avatar"><Users size={19}/></div>
          <div className="tutor-enrollment-student">
            <strong>{enrollment.studentName}</strong>
            <span>{enrollment.grade || enrollment.className || 'Khối lớp chưa cập nhật'}</span>
          </div>
          <span className={`tutor-status-badge ${isRequest ? 'pending' : 'active'}`}>{isRequest ? 'Chờ duyệt' : 'Đang dạy'}</span>
        </div>
        <div className="tutor-enrollment-details">
          <span><BookOpen size={15}/>{enrollment.subject}</span>
          <span><CalendarDays size={15}/>{enrollment.dayOfWeek === undefined ? 'Chưa xếp ngày' : dayLabels[enrollment.dayOfWeek]}</span>
          <span><Clock3 size={15}/>{enrollment.startTime || 'Chưa xếp giờ'}</span>
        </div>
        {(enrollment.startDate || enrollment.endDate) && (
          <p className="tutor-enrollment-period">Thời hạn: {enrollment.startDate || 'Chưa xác định'} – {enrollment.endDate || 'Chưa xác định'}</p>
        )}
        {isRequest ? (
          <div className="tutor-request-actions">
            <button type="button" className="tutor-accept-button" disabled={processingId === enrollment._id} onClick={() => handleEnrollmentDecision(enrollment, 'active')}>
              <Check size={16}/> Nhận học viên
            </button>
            <button type="button" className="tutor-reject-button" disabled={processingId === enrollment._id} onClick={() => handleEnrollmentDecision(enrollment, 'rejected')}>
              <X size={16}/> Từ chối
            </button>
          </div>
        ) : (
          <div className="tutor-session-report">
            <label htmlFor={`session-date-${enrollment._id}`}>Ngày buổi học</label>
            <input
              id={`session-date-${enrollment._id}`}
              type="date"
              min={enrollment.startDate || undefined}
              max={[enrollment.endDate, todayDateKeys[enrollment._id]].filter(Boolean).sort()[0] || undefined}
              value={sessionDate}
              onChange={(event) => setSessionDates((dates) => ({ ...dates, [enrollment._id]: event.target.value }))}
            />
            <span>Chọn ngày đúng với lịch {enrollment.dayOfWeek === undefined ? 'đã thỏa thuận' : dayLabels[enrollment.dayOfWeek]}.</span>
            {completedSession
              ? <div className="tutor-session-completed">Đã hoàn tất · {completedSession.rating ?? '-'}★{completedSession.feedback ? ` · ${completedSession.feedback}` : ''}</div>
              : <button
                  type="button"
                  className="tutor-review-button"
                  disabled={!sessionDate || !Number.isInteger(enrollment.dayOfWeek)}
                  onClick={() => openLessonReport(enrollment)}
                >
                  Đánh giá buổi học
                </button>}
          </div>
        )}
      </article>
    );
  };

  const visibleSlots = timeSlots.filter(({ minutes }) => {
    if (timeRange === 'morning') return minutes >= 6 * 60 && minutes < 12 * 60;
    if (timeRange === 'afternoon') return minutes >= 12 * 60 && minutes < 18 * 60;
    if (timeRange === 'evening') return minutes >= 18 * 60;
    return true;
  });
  const scheduleEvents = activeEnrollments.flatMap((enrollment) => {
    const dayIndex = week.days.findIndex((day) => day.day === enrollment.dayOfWeek
      && (!enrollment.startDate || day.key >= enrollment.startDate)
      && (!enrollment.endDate || day.key <= enrollment.endDate));
    const slotIndex = visibleSlots.findIndex((slot) => slot.time === enrollment.startTime);
    if (dayIndex < 0 || slotIndex < 0) return [];
    return [{
      enrollment,
      dayIndex,
      slotIndex,
      durationRows: Math.min(
        Math.max(1, Math.ceil((enrollment.durationMinutes || 90) / 30)),
        visibleSlots.length - slotIndex
      ),
    }];
  });
  const nextScheduledEnrollment = activeEnrollments
    .map((enrollment) => ({ enrollment, dateKey: getNextScheduledDate(enrollment, scheduleNow) }))
    .filter((item) => item.dateKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey)
      || (a.enrollment.startTime || '').localeCompare(b.enrollment.startTime || ''))[0];

  const navigation = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'schedule', label: 'Lịch dạy', icon: CalendarDays },
    { id: 'classes', label: 'Lớp học', icon: BookOpen },
    { id: 'requests', label: 'Yêu cầu học', icon: Target },
    { id: 'history', label: 'Lịch sử dạy', icon: History },
    { id: 'profile', label: 'Hồ sơ', icon: Users },
  ];

  return (
    <div className="student-dashboard tutor-dashboard">
      <aside className="tutor-sidebar" aria-label="Điều hướng gia sư">
        <button type="button" className="tutor-sidebar-brand" aria-label="TutorCenter - tổng quan" onClick={() => setActiveTab('overview')}>
          <span className="tutor-logo-mark">T</span>
          <span className="tutor-logo-caption">Tutor</span>
        </button>
        <nav className="tutor-sidebar-nav">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => setActiveTab(id)}
              className={`tutor-sidebar-link${activeTab === id ? ' active' : ''}`}
            >
              <Icon size={19}/>
              {id === 'requests' && pendingEnrollments.length > 0 && <span className="tutor-sidebar-badge">{pendingEnrollments.length}</span>}
            </button>
          ))}
        </nav>
        <div className="tutor-sidebar-bottom">
          <div className="tutor-sidebar-notifications"><NotificationCenter/></div>
          <button type="button" className="tutor-sidebar-link tutor-sidebar-logout" title="Đăng xuất" aria-label="Đăng xuất" onClick={handleLogout}>
            <LogOut size={18}/>
          </button>
        </div>
      </aside>

      <div className="tutor-workspace">
        <header className="tutor-topbar">
          <div className="tutor-topbar-brand">
            <div className="tutor-brand-icon"><GraduationCap size={19}/></div>
            <div><strong>TutorCenter</strong><span>Không gian gia sư</span></div>
          </div>
          <div className="tutor-topbar-user">
            <span>{profile.fullName || 'Gia sư'}</span>
            <div className="tutor-topbar-avatar">{profile.avatar ? <img src={profile.avatar} alt="Ảnh đại diện"/> : <GraduationCap size={17}/>}</div>
          </div>
        </header>

        <main className="tutor-main">
          {loading && <div className="tutor-feedback" role="status">Đang tải bảng điều khiển gia sư...</div>}
          {!loading && loadError && (
            <div className="tutor-feedback tutor-feedback-error" role="alert">
              <p>{loadError}</p>
              <button type="button" onClick={handleRefresh}>Thử tải lại</button>
            </div>
          )}

          {!loading && !loadError && activeTab === 'overview' && (
            <>
              <div className="tutor-page-title-row">
                <div><span className="tutor-page-eyebrow">BẢNG ĐIỀU KHIỂN</span><h1>Xin chào, {profile.fullName || 'gia sư'}!</h1><p>Theo dõi lớp học và lịch dạy của bạn tại một nơi.</p></div>
                <button type="button" className="tutor-refresh-button" onClick={handleRefresh}><RefreshCw size={15}/> Làm mới</button>
              </div>

              <section className={`tutor-announcement${announcementExpanded ? '' : ' collapsed'}`}>
                <header>
                  <span className="tutor-announcement-icon"><Megaphone size={18}/></span>
                  <div><span>THÔNG BÁO</span><strong>CẬP NHẬT HOẠT ĐỘNG GIA SƯ</strong></div>
                  <button type="button" onClick={() => setAnnouncementExpanded((expanded) => !expanded)}>{announcementExpanded ? 'Thu gọn' : 'Xem thêm'}</button>
                </header>
                {announcementExpanded && (
                  <div className="tutor-announcement-body">
                    <p>Yêu cầu học mới sẽ hiển thị tại mục <strong>Yêu cầu học</strong>. Hãy kiểm tra môn học, khối lớp và thời gian trước khi nhận lớp.</p>
                    <div className="tutor-process-steps">
                      {['Xem yêu cầu học', 'Kiểm tra lịch dạy', 'Nhận hoặc từ chối lớp'].map((step, index) => (
                        <div key={step}><span>{index + 1}</span><p>{step}</p></div>
                      ))}
                    </div>
                    <div className="tutor-announcement-tip"><Clock3 size={16}/><span>Chỉ lớp đã được xác nhận mới xuất hiện trong lịch dạy. Hoàn tất buổi học và gửi đánh giá trong mục Lịch sử dạy.</span></div>
                  </div>
                )}
              </section>

              <section className="tutor-open-classes">
                <header className="tutor-open-classes-heading">
                  <div className="tutor-section-title">
                    <span className="tutor-target-icon"><Target size={19}/></span>
                    <div><h2>Yêu cầu học mới</h2><p>Xem lịch học mong muốn và kết nối với học viên.</p></div>
                  </div>
                  <button type="button" className="tutor-outline-button" onClick={() => setActiveTab('requests')}><Users size={15}/> Xem tất cả</button>
                </header>
                <div className="tutor-open-summary">
                  <span><i className="tutor-dot red"/> <strong>{pendingEnrollments.length}</strong> yêu cầu đang chờ</span>
                  <span><i className="tutor-dot blue"/> <strong>{activeEnrollments.length}</strong> lớp đã nhận</span>
                  <button type="button" onClick={handleRefresh}><RefreshCw size={13}/> Làm mới danh sách</button>
                </div>
                {requestMessage && <p className="tutor-feedback tutor-feedback-success" role="status">{requestMessage}</p>}
                {requestError && <p className="tutor-feedback tutor-feedback-error" role="alert">{requestError}</p>}
                {pendingEnrollments.length === 0
                  ? <div className="tutor-open-empty"><span><Target size={22}/></span><strong>Chưa có yêu cầu học mới</strong><p>Khi học viên đăng ký lớp với bạn, yêu cầu sẽ xuất hiện tại đây.</p></div>
                  : <div className="tutor-request-list">{pendingEnrollments.slice(0, 3).map((item) => renderEnrollmentCard(item, true))}</div>}
              </section>

              <section className="tutor-overview-stats">
                <article><span className="tutor-stat-icon"><BookOpen size={18}/></span><div><strong>{activeEnrollments.length}</strong><span>Lớp đang dạy</span></div></article>
                <article><span className="tutor-stat-icon"><Users size={18}/></span><div><strong>{uniqueStudentCount}</strong><span>Học viên</span></div></article>
                <article><span className="tutor-stat-icon"><Clock3 size={18}/></span><div><strong>{historyItems.length}</strong><span>Buổi đã hoàn thành</span></div></article>
              </section>
            </>
          )}

          {!loading && !loadError && activeTab === 'schedule' && (
            <>
              <section className="tutor-blue-banner">
                <span className="tutor-blue-banner-icon"><CalendarDays size={20}/></span>
                <div><h1>Lịch dạy của tôi</h1><p>Bảng theo dõi các buổi học, mở rộng chi tiết phòng học và điểm danh nhanh chóng.</p></div>
              </section>
              <section className="tutor-calendar-toolbar">
                <div className="tutor-calendar-filters">
                  <label className="tutor-select-wrap"><span className="sr-only">Lọc khung giờ</span>
                    <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)}>
                      <option value="all">Ca: 24h</option>
                      <option value="morning">Buổi sáng · 06–12h</option>
                      <option value="afternoon">Buổi chiều · 12–18h</option>
                      <option value="evening">Buổi tối · 18–24h</option>
                    </select>
                  </label>
                </div>
                <div className="tutor-week-controls">
                  <button type="button" onClick={() => handleWeekChange(-1)}>Tuần trước</button>
                  <button type="button" onClick={() => { setWeekOffset(0); setWeek(buildWeek(0)); }}>Tuần này</button>
                  <button type="button" onClick={() => handleWeekChange(1)}>Tuần sau</button>
                </div>
                <div className="tutor-week-label"><button type="button" aria-label="Tuần trước" onClick={() => handleWeekChange(-1)}><ChevronLeft size={17}/></button><strong>{week.rangeLabel}</strong><button type="button" aria-label="Tuần sau" onClick={() => handleWeekChange(1)}><ChevronRight size={17}/></button></div>
              </section>
              <section className="tutor-calendar-card">
                {activeEnrollments.length === 0
                  ? <div className="tutor-open-empty"><span><CalendarDays size={22}/></span><strong>Chưa có buổi dạy nào</strong><p>Lịch sẽ được cập nhật khi bạn nhận lớp.</p></div>
                  : scheduleEvents.length === 0
                    ? (
                      <div className="tutor-open-empty tutor-schedule-empty">
                        <span><CalendarDays size={22}/></span>
                        <strong>Không có buổi dạy trong tuần đang xem</strong>
                        {nextScheduledEnrollment
                          ? (
                            <>
                              <p>
                                Lớp đã được xác nhận. Buổi tiếp theo là {new Date(`${nextScheduledEnrollment.dateKey}T12:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} lúc {nextScheduledEnrollment.enrollment.startTime}.
                              </p>
                              <button
                                type="button"
                                className="tutor-outline-button"
                                onClick={() => {
                                  const nextWeekOffset = getWeekOffsetForDate(nextScheduledEnrollment.dateKey);
                                  setWeekOffset(nextWeekOffset);
                                  setWeek(buildWeek(nextWeekOffset));
                                  setTimeRange('all');
                                }}
                              >
                                Xem tuần có buổi dạy
                              </button>
                            </>
                          )
                          : <p>Các lớp đã nhận chưa có buổi học sắp tới trong thời hạn đăng ký hoặc chưa đủ thông tin lịch.</p>}
                      </div>
                    )
                  : (
                    <div className="tutor-calendar-scroll">
                      <div
                        className="tutor-calendar-grid"
                        style={{
                          gridTemplateColumns: '72px repeat(7, minmax(126px, 1fr))',
                          gridTemplateRows: `48px repeat(${visibleSlots.length}, 34px)`,
                        }}
                      >
                        <div className="tutor-calendar-corner">GIỜ</div>
                        {week.days.map((day) => (
                          <div className="tutor-calendar-day-heading" key={day.key}>
                            <strong>{day.date}</strong><span>{day.label.toLocaleUpperCase('vi-VN')}</span>
                          </div>
                        ))}
                        {visibleSlots.map((slot, index) => (
                          <React.Fragment key={slot.time}>
                            <div className="tutor-calendar-time" style={{ gridColumn: 1, gridRow: index + 2 }}>{slot.time}</div>
                            {week.days.map((day, dayIndex) => (
                              <div className="tutor-calendar-cell" key={`${day.key}-${slot.time}`} style={{ gridColumn: dayIndex + 2, gridRow: index + 2 }}>–</div>
                            ))}
                          </React.Fragment>
                        ))}
                        {scheduleEvents.map(({ enrollment, dayIndex, slotIndex, durationRows }) => (
                          <article
                            className="tutor-calendar-event"
                            key={`${enrollment._id}-${week.days[dayIndex].key}`}
                            style={{ gridColumn: dayIndex + 2, gridRow: `${slotIndex + 2} / span ${durationRows}` }}
                          >
                            <strong>{enrollment.startTime} · {enrollment.subject}</strong>
                            <span>{enrollment.studentName}</span>
                            <small>{enrollment.className} · {enrollment.durationMinutes || 90} phút</small>
                            {enrollment.meetingLink
                              ? <a className="tutor-calendar-room-link" href={enrollment.meetingLink} target="_blank" rel="noreferrer">Mở phòng học ↗</a>
                              : <small className="tutor-calendar-room-missing">Chưa có link phòng học</small>}
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
              </section>
              {activeEnrollments.some((item) => !Number.isInteger(item.dayOfWeek) || !item.startTime) && (
                <section className="tutor-section-card">
                  <header className="tutor-section-heading"><div><span className="tutor-section-kicker">CHƯA XẾP LỊCH</span><h2>Lớp chưa có lịch đầy đủ</h2></div></header>
                  <div className="tutor-request-list">{activeEnrollments.filter((item) => !Number.isInteger(item.dayOfWeek) || !item.startTime).map((item) => renderEnrollmentCard(item))}</div>
                </section>
              )}
            </>
          )}

          {!loading && !loadError && activeTab === 'requests' && (
            <>
              <section className="tutor-blue-banner">
                <span className="tutor-blue-banner-icon"><Target size={20}/></span>
                <div><h1>Yêu cầu học mới</h1><p>Xem thông tin lớp và chọn yêu cầu phù hợp với lịch giảng dạy của bạn.</p></div>
              </section>
              {requestMessage && <p className="tutor-feedback tutor-feedback-success" role="status">{requestMessage}</p>}
              {requestError && <p className="tutor-feedback tutor-feedback-error" role="alert">{requestError}</p>}
              <section className="tutor-section-card">
                <header className="tutor-section-heading">
                  <div><span className="tutor-section-kicker">KẾT NỐI HỌC VIÊN</span><h2>{pendingEnrollments.length} yêu cầu đang chờ</h2></div>
                  <button type="button" className="tutor-refresh-button" onClick={handleRefresh}><RefreshCw size={15}/> Làm mới</button>
                </header>
                <label className="tutor-search-box"><Search size={16}/><input value={requestSearch} onChange={(event) => setRequestSearch(event.target.value)} placeholder="Tìm theo học viên, môn học hoặc lớp"/></label>
                {filteredRequests.length === 0
                  ? <div className="tutor-open-empty"><span><Search size={22}/></span><strong>{pendingEnrollments.length ? 'Không tìm thấy yêu cầu phù hợp' : 'Hiện chưa có yêu cầu đăng ký'}</strong><p>{pendingEnrollments.length ? 'Thử từ khóa khác để tìm yêu cầu học.' : 'Yêu cầu mới từ học viên sẽ được hiển thị tại đây.'}</p></div>
                  : <div className="tutor-request-list">{filteredRequests.map((item) => renderEnrollmentCard(item, true))}</div>}
              </section>
            </>
          )}

          {!loading && !loadError && activeTab === 'classes' && (
            <>
              <section className="tutor-blue-banner">
                <span className="tutor-blue-banner-icon"><BookOpen size={20}/></span>
                <div><h1>Lớp học của tôi</h1><p>Quản lý học viên, lịch đã nhận và đánh giá từng buổi học.</p></div>
              </section>
              {reportMessage && <p className="tutor-feedback tutor-feedback-success" role="status">{reportMessage}</p>}
              <section className="tutor-section-card">
                <header className="tutor-section-heading"><div><span className="tutor-section-kicker">ĐANG HOẠT ĐỘNG</span><h2>{activeEnrollments.length} lớp đã nhận</h2></div><button type="button" className="tutor-refresh-button" onClick={handleRefresh}><RefreshCw size={15}/> Làm mới</button></header>
                {activeEnrollments.length === 0
                  ? <div className="tutor-open-empty"><span><BookOpen size={22}/></span><strong>Bạn chưa nhận lớp nào</strong><p>Các lớp đã được xác nhận sẽ xuất hiện tại đây.</p></div>
                  : <div className="tutor-request-list">{activeEnrollments.map((item) => renderEnrollmentCard(item))}</div>}
              </section>
            </>
          )}

          {!loading && !loadError && activeTab === 'history' && (
            <>
              <section className="tutor-blue-banner">
                <span className="tutor-blue-banner-icon"><History size={20}/></span>
                <div><h1>Lịch sử buổi dạy</h1><p>Xem lại buổi học đã hoàn tất và theo dõi thời lượng giảng dạy.</p></div>
              </section>
              <div className="tutor-history-toolbar">
                <div className="tutor-month-controls">
                  <button type="button" aria-label="Tháng trước" onClick={() => handleMonthChange(-1)}><ChevronLeft size={17}/></button>
                  <input aria-label="Chọn tháng" type="month" value={historyMonth} onChange={(event) => setHistoryMonth(event.target.value)}/>
                  <button type="button" aria-label="Tháng sau" onClick={() => handleMonthChange(1)}><ChevronRight size={17}/></button>
                </div>
                <span>{monthHistory.length} buổi trong lịch sử</span>
              </div>
              <section className="tutor-history-stats">
                <article><strong>{monthHistory.length}</strong><span>Buổi đã dạy</span></article>
                <article><strong>{historyMinutes.toLocaleString('vi-VN')}’</strong><span>Tổng số phút</span></article>
                <article className="tutor-income-stat"><strong>{formatCurrency(historyEstimate)}</strong><span>Ước tính theo học phí hồ sơ</span></article>
              </section>
              {historyEstimate > 0 && <p className="tutor-estimate-note">Khoản thu nhập trên chỉ là ước tính theo mức học phí hồ sơ và thời lượng lớp, chưa phải dữ liệu thanh toán/đối soát.</p>}
              <section className="tutor-history-list">
                {monthHistory.length === 0
                  ? <div className="tutor-open-empty"><span><History size={22}/></span><strong>Chưa có buổi dạy hoàn thành trong tháng này</strong><p>Sau khi gia sư hoàn tất và đánh giá buổi học, lịch sử sẽ xuất hiện ở đây.</p></div>
                  : monthHistory.map(({ enrollment, session }) => {
                    const minutes = enrollment.durationMinutes || 90;
                    const estimatedPay = profile.pricePer25Min > 0 ? (minutes / 25) * profile.pricePer25Min : 0;
                    return (
                      <article className="tutor-history-item" key={`${enrollment._id}-${session.lessonDate}`}>
                        <div className="tutor-history-date"><span>{session.lessonDate.slice(8, 10)}</span><small>{session.lessonDate.slice(5, 7)}/{session.lessonDate.slice(0, 4)}</small></div>
                        <div className="tutor-history-info"><strong>{enrollment.studentName}</strong><span>{enrollment.className} · {minutes} phút</span><small>{enrollment.subject}</small></div>
                        <div className="tutor-history-rating"><Star size={14} fill="currentColor"/><span>{session.rating ?? '—'}</span></div>
                        <div className="tutor-history-pay">{estimatedPay > 0 ? formatCurrency(estimatedPay) : 'Chưa có học phí'}</div>
                        <span className="tutor-history-status"><BadgeCheck size={15}/> Đã hoàn tất</span>
                      </article>
                    );
                  })}
              </section>
            </>
          )}

          {!loading && !loadError && activeTab === 'profile' && (
            <div className="tutor-profile-page">
              <section className="tutor-profile-summary">
                <div className="tutor-profile-cover"/>
                <div className="tutor-profile-summary-content">
                  <div className="tutor-profile-avatar">{profile.avatar ? <img src={profile.avatar} alt={`Ảnh đại diện ${profile.fullName}`}/> : <span>{profile.fullName.split(' ').map((part) => part[0]).slice(-2).join('').toLocaleUpperCase() || 'T'}</span>}</div>
                  <div className="tutor-profile-identity">
                    <span className="tutor-profile-kicker">HỒ SƠ GIA SƯ</span>
                    <h1>{profile.fullName || 'Tên gia sư'}</h1>
                    <span className="tutor-profile-login">Tài khoản · {profile.email || 'Chưa có email'}</span>
                    {profile.title && <span className="tutor-profile-title">{profile.title}</span>}
                  </div>
                  <div className="tutor-profile-completion"><strong>{profileCompletion}%</strong><span>Hoàn thiện hồ sơ</span><div><i style={{ width: `${profileCompletion}%` }}/></div></div>
                </div>
                <p className="tutor-profile-bio">{profile.bio || 'Hãy thêm lời giới thiệu ngắn để học viên hiểu hơn về kinh nghiệm và phương pháp giảng dạy của bạn.'}</p>
                {profile.subjectsTaught.length > 0 && <div className="tutor-profile-subjects">{profile.subjectsTaught.map((subject) => <span key={subject}>{subject}</span>)}</div>}
              </section>

              {profileCompletion === 100
                ? <div className="tutor-profile-alert complete"><BadgeCheck size={18}/><div><strong>Hồ sơ đã đầy đủ</strong><span>Thông tin cơ bản và môn giảng dạy của bạn đã được cập nhật.</span></div></div>
                : <div className="tutor-profile-alert"><Award size={18}/><div><strong>Hoàn thiện hồ sơ gia sư</strong><span>Bổ sung các thông tin bên dưới để hồ sơ chuyên nghiệp và đầy đủ hơn.</span></div></div>}

              {profileError && <p className="tutor-feedback tutor-feedback-error" role="alert">{profileError}</p>}
              {isProfileSaved && <p className="tutor-feedback tutor-feedback-success" role="status">Đã lưu hồ sơ gia sư.</p>}
              <form onSubmit={handleSaveProfile} className="tutor-profile-form">
                <section className="tutor-profile-section">
                  <header><span className="tutor-profile-section-icon"><Users size={17}/></span><div><h2>Thông tin cá nhân</h2><p>Thông tin hiển thị với học viên khi tìm gia sư.</p></div></header>
                  <div className="tutor-profile-fields">
                    <label className="tutor-field-wide">Họ và tên<input type="text" value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} required/></label>
                    <label>Tên đăng nhập / Email<input type="email" value={profile.email} disabled/></label>
                    <label>Số điện thoại<input type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="Nhập số điện thoại"/></label>
                    <label>Giới tính<select value={profile.gender} onChange={(event) => setProfile({ ...profile, gender: event.target.value })}><option value="">Chọn giới tính</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option></select></label>
                    <label>Năm sinh<input type="number" min="1940" max={maxTutorBirthYear} value={profile.birthYear ?? ''} onChange={(event) => setProfile({ ...profile, birthYear: event.target.value ? Number(event.target.value) : null })} placeholder="Ví dụ: 2000"/></label>
                    <label className="tutor-field-wide">Chức danh<input type="text" value={profile.title} onChange={(event) => setProfile({ ...profile, title: event.target.value })} placeholder="Ví dụ: Gia sư Toán - Lý"/></label>
                  </div>
                </section>

                <section className="tutor-profile-section">
                  <header><span className="tutor-profile-section-icon"><MapPin size={17}/></span><div><h2>Khu vực sinh sống</h2><p>Giúp học viên tìm gia sư phù hợp với vị trí.</p></div></header>
                  <div className="tutor-profile-fields">
                    <fieldset className="tutor-region-field tutor-field-wide"><legend>Khu vực</legend><div>{regions.map((region) => <button type="button" key={region} className={profile.region === region ? 'selected' : ''} onClick={() => setProfile({ ...profile, region })}>{region}</button>)}</div></fieldset>
                    <label className="tutor-field-wide">Tỉnh / Thành phố<input type="text" value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} placeholder="Ví dụ: Hà Nội"/></label>
                  </div>
                </section>

                <section className="tutor-profile-section">
                  <header><span className="tutor-profile-section-icon"><GraduationCap size={17}/></span><div><h2>Học vấn &amp; chuyên môn</h2><p>Chia sẻ nền tảng học tập và kinh nghiệm chuyên môn.</p></div></header>
                  <div className="tutor-profile-fields">
                    <label>Học vị / Học hàm<select value={profile.educationLevel} onChange={(event) => setProfile({ ...profile, educationLevel: event.target.value })}><option value="">Chọn học vị</option>{educationLevels.map((level) => <option key={level} value={level}>{level}</option>)}</select></label>
                    <label>Trường học<input type="text" value={profile.institution} onChange={(event) => setProfile({ ...profile, institution: event.target.value })} placeholder="Tên trường / đơn vị"/></label>
                    <label className="tutor-field-wide">Chuyên ngành<input type="text" value={profile.major} onChange={(event) => setProfile({ ...profile, major: event.target.value })} placeholder="Ví dụ: Công nghệ thông tin"/></label>
                  </div>
                </section>

                <section className="tutor-profile-section">
                  <header><span className="tutor-profile-section-icon"><BookOpen size={17}/></span><div><h2>Lĩnh vực &amp; môn học giảng dạy</h2><p>Chọn các môn phù hợp với kinh nghiệm chuyên môn của bạn.</p></div></header>
                  <div className="tutor-subject-picker">
                    {teachingSubjectGroups.map((group) => (
                      <fieldset className="tutor-subject-group" key={group.title}>
                        <legend>{group.title}</legend>
                        <div>{group.subjects.map((subject) => (
                          <label key={subject}>
                            <input type="checkbox" checked={selectedTeachingSubjects.includes(subject)} onChange={(event) => toggleTeachingSubject(subject, event.target.checked)}/>
                            <span>{subject}</span>
                          </label>
                        ))}</div>
                      </fieldset>
                    ))}
                    <label className="tutor-custom-subjects">Môn khác (cách nhau bằng dấu phẩy)<input type="text" value={customTeachingSubjects.join(', ')} onChange={(event) => updateCustomSubjects(event.target.value)} placeholder="Ví dụ: Kỹ năng thuyết trình, Lập trình"/></label>
                  </div>
                </section>

                <section className="tutor-profile-section">
                  <header><span className="tutor-profile-section-icon"><Wallet size={17}/></span><div><h2>Học phí &amp; giới thiệu</h2><p>Mức học phí tham khảo và thông tin giới thiệu cho học viên.</p></div></header>
                  <div className="tutor-profile-fields">
                    <label>Học phí mỗi 25 phút (VND)<input type="number" min="0" value={profile.pricePer25Min} onChange={(event) => setProfile({ ...profile, pricePer25Min: Number(event.target.value) })}/></label>
                    <label className="tutor-field-wide">Giới thiệu<textarea rows={5} value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} placeholder="Chia sẻ kinh nghiệm, thành tích và phương pháp giảng dạy của bạn."/></label>
                  </div>
                </section>
                <button type="submit" className="tutor-save-profile" disabled={isSaving}><Save size={16}/>{isSaving ? 'Đang lưu...' : 'Lưu hồ sơ gia sư'}</button>
              </form>
            </div>
          )}

          {reportMessage && <p className="tutor-feedback tutor-feedback-success" role="status">{reportMessage}</p>}
          {reportEnrollment && (
            <div className="tutor-modal-backdrop" onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isSubmittingReport) setReportEnrollment(null);
            }}>
              <section className="tutor-report-modal" role="dialog" aria-modal="true" aria-labelledby="tutor-report-title">
                <button type="button" className="tutor-report-close" aria-label="Đóng" disabled={isSubmittingReport} onClick={() => setReportEnrollment(null)}><X size={18}/></button>
                <span className="tutor-section-kicker">HOÀN TẤT BUỔI HỌC</span>
                <h2 id="tutor-report-title">Đánh giá {reportEnrollment.studentName}</h2>
                <p>{reportEnrollment.subject} · {reportDate}</p>
                {reportError && <p className="tutor-feedback tutor-feedback-error" role="alert">{reportError}</p>}
                <form onSubmit={handleCompleteLesson}>
                  <label htmlFor="tutor-report-rating">Đánh giá buổi học</label>
                  <select id="tutor-report-rating" value={reportRating} onChange={(event) => setReportRating(Number(event.target.value))}>
                    <option value={5}>5 sao · Xuất sắc</option>
                    <option value={4}>4 sao · Tốt</option>
                    <option value={3}>3 sao · Đạt yêu cầu</option>
                    <option value={2}>2 sao · Cần cố gắng</option>
                    <option value={1}>1 sao · Cần cải thiện</option>
                  </select>
                  <label htmlFor="tutor-report-feedback">Nhận xét cho học viên (không bắt buộc)</label>
                  <textarea id="tutor-report-feedback" rows={4} maxLength={1000} value={reportFeedback} onChange={(event) => setReportFeedback(event.target.value)} placeholder="Nhập nhận xét về buổi học..."/>
                  <button type="submit" className="tutor-save-profile" disabled={isSubmittingReport}>
                    {isSubmittingReport ? 'Đang lưu...' : 'Xác nhận hoàn thành & gửi đánh giá'}
                  </button>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
