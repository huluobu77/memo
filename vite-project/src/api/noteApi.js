import request from '@/utils/request'

export function insertNote(userId, title, content, createTime, imgUrl) {
  return request({
    url: "/notes/insertNote",
    method: "post",
    data: { userId, title, content, createTime, imgUrl }
  });
}

export function getAllNote(userId) {
  return request.post('/notes/getAllNote',{userId})
} 

export function deleteNote(noteId,userId) {
  return request.post('/notes/deleteNote',{noteId,userId})
} 

export function getEditNote(noteId,userId) {
  return request.post('/notes/getEditNote',{noteId,userId})
} 

export function editNote(noteId,userId,title,content,updateTime,img) {
  return request.post('/notes/editNote',{noteId,userId,title,content,updateTime,img})
} 
