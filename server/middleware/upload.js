import multer from 'multer'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
const directory=fileURLToPath(new URL('../uploads/',import.meta.url))
fs.mkdirSync(directory,{recursive:true})
const extensions={ 'image/jpeg':['.jpg','.jpeg'], 'image/png':['.png'], 'image/webp':['.webp'] }
const storage=multer.diskStorage({destination:directory,filename:(_req,file,cb)=>cb(null,`${randomUUID()}${extensions[file.mimetype]?.[0]||'.img'}`)})
function fileFilter(_req,file,cb){const allowed=extensions[file.mimetype];const extension=file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();if(!allowed||!allowed.includes(extension)){const error=new Error('Chỉ nhận ảnh JPG, PNG hoặc WEBP.');error.status=400;return cb(error)}cb(null,true)}
export const uploadImage=multer({storage,fileFilter,limits:{fileSize:2*1024*1024}})
