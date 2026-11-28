import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Tutor from './models/Tutor.js'
import sampleTutors from './data/tutors.js'

const demoAccounts = [
  { id:'t1', loginEmail:'minhanh.tutor@gmail.com', phone:'0987241630' },
  { id:'t2', loginEmail:'hoangnam.ly@gmail.com', phone:'0912384715' },
  { id:'t3', loginEmail:'thuha.english@gmail.com', phone:'0905612847' },
  { id:'t4', loginEmail:'quanghuy.chem@tutorcenter.vn', phone:'0973428106' },
  { id:'t5', loginEmail:'ngocmai.van@tutorcenter.vn', phone:'0934705218' },
  { id:'t6', loginEmail:'giabao.math@tutorcenter.vn', phone:'0968173452' },
  { id:'t7', loginEmail:'khanhlinh.english@tutorcenter.vn', phone:'0981560394' },
  { id:'t8', loginEmail:'duclong.physics@tutorcenter.vn', phone:'0942816573' },
  { id:'t9', loginEmail:'thuyduong.chem@tutorcenter.vn', phone:'0908237641' },
  { id:'t10', loginEmail:'nhatvy.van@tutorcenter.vn', phone:'0977395824' },
]

async function seed() {
  if (!process.env.MONGODB_URI?.trim()) throw new Error('Hãy điền MONGODB_URI trong server/.env trước khi chạy seed.')
  await mongoose.connect(process.env.MONGODB_URI)

  // Gỡ index ghép cũ có nhiều trường mảng để tránh lỗi parallel arrays.
  // Chỉ xóa index chứa đồng thời subjects, grades và areas; giữ nguyên các index khác.
  try {
    const existingIndexes = await Tutor.collection.indexes()
    const legacyParallelArrayIndex = existingIndexes.find(index =>
      index.key?.subjects === 1 && index.key?.grades === 1 && index.key?.areas === 1,
    )
    if (legacyParallelArrayIndex) {
      await Tutor.collection.dropIndex(legacyParallelArrayIndex.name)
      console.log(`Đã xóa index ghép cũ: ${legacyParallelArrayIndex.name}`)
    }
  } catch (error) {
    if (error.code !== 26 && error.codeName !== 'NamespaceNotFound') throw error
    console.log('Collection tutors chưa tồn tại; bỏ qua bước xóa index cũ.')
  }

  const adminPassword = await bcrypt.hash('Admin123!', 10)
  await User.findOneAndUpdate({ loginEmail:'admin@tutorcenter.vn' }, { $set: { loginEmail:'admin@tutorcenter.vn', password:adminPassword, role:'admin', fullName:'Quản trị viên', avatar:'', phone:'' } }, { upsert:true, new:true, setDefaultsOnInsert:true })
  const studentPassword = await bcrypt.hash('Student123!', 10)
  await User.findOneAndUpdate({ loginEmail:'student@tutorcenter.vn' }, { $set: { loginEmail:'student@tutorcenter.vn', password:studentPassword, role:'student', fullName:'Học viên mẫu', avatar:'', phone:'0988000000', tutorId:null } }, { upsert:true, new:true, setDefaultsOnInsert:true })

  for (const sample of sampleTutors) {
    const accountInfo = demoAccounts.find(item => item.id === sample.id)
    if (!accountInfo) continue
    const hashedPassword = await bcrypt.hash('Tutor123!', 10)
    const user = await User.findOneAndUpdate(
      { loginEmail:accountInfo.loginEmail },
      { $set: { loginEmail:accountInfo.loginEmail, password:hashedPassword, role:'tutor', fullName:sample.name, avatar:sample.avatar || '', phone:accountInfo.phone } },
      { upsert:true, new:true, setDefaultsOnInsert:true },
    )
    const tutorValues = {
      userId:user._id,
      fullName:sample.name,
      avatar:sample.avatar || '',
      subjects:sample.subjects || [sample.subject].filter(Boolean),
      grades:sample.levels || [],
      areas:sample.areas || [],
      teachingFormat:sample.mode || 'Cả hai',
      hourlyRate:Number(sample.fee) || 200000,
      rating:Number(sample.rating) || 5,
      experienceYears:Number(sample.experienceYears) || 0,
      bio:sample.bio || '',
      education:sample.education || '',
      major:sample.major || '',
      certificates:sample.certificates || [],
      phone:accountInfo.phone,
      contactEmail:sample.contactEmail || accountInfo.loginEmail,
      availability:sample.availability || [],
      teachingStyle:sample.teachingStyle || '',
      achievements:sample.achievements || [],
      stats:sample.stats || { studentsCount:0, lessonsCount:0, responseTime:'Chưa cập nhật' },
      reviews:sample.reviews || [],
    }
    const tutor = await Tutor.findOneAndUpdate({ userId:user._id }, { $set:tutorValues }, { upsert:true, new:true, runValidators:true, setDefaultsOnInsert:true })
    if (String(user.tutorId || '') !== String(tutor._id)) { user.tutorId = tutor._id; await user.save() }
  }

  console.log(`Đã nạp ${sampleTutors.length} hồ sơ gia sư cùng admin, tutor và học viên mẫu.`)
  console.log('Tài khoản mẫu: admin@tutorcenter.vn / Admin123!; student@tutorcenter.vn / Student123!; tutor / Tutor123!')
}

seed().catch(error => { console.error('Seed thất bại:', error.message); process.exitCode = 1 }).finally(async () => { await mongoose.disconnect() })
