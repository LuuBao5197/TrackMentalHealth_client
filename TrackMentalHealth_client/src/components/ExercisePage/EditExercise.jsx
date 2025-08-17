import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Swal from 'sweetalert2';

const CONDITION_TYPES = [
  { value: 'LEFT_HAND_UP', label: 'Left Hand Up' },
  { value: 'RIGHT_HAND_UP', label: 'Right Hand Up' },
  { value: 'TURN_HEAD_UP', label: 'Turn Head Up' },
  { value: 'TURN_HEAD_DOWN', label: 'Turn Head Down' },
  { value: 'TURN_HEAD_LEFT', label: 'Turn Head Left' },
  { value: 'TURN_HEAD_RIGHT', label: 'Turn Head Right' },
];

const token = localStorage.getItem('token');
let contentCreatorId = null;
if (token) {
  try { contentCreatorId = jwtDecode(token).contentCreatorId; } 
  catch { console.error('Invalid token'); }
}

const EditExercise = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [createdAt, setCreatedAt] = useState(null);

  // Validation
  const validate = (values) => {
    const errors = {};
    if (!values.title) errors.title = 'Title is required';
    if (!values.instruction) errors.instruction = 'Instruction is required';
    if (values.mediaType !== 'camera' && !values.mediaUrl) errors.mediaUrl = 'Media file is required';
    if (!values.photo) errors.photo = 'Thumbnail image is required';
    if (values.mediaType === 'camera') {
      conditions.forEach((c, i) => {
        if (!c.type) errors[`condition_${i}_type`] = 'Type is required';
        if (!c.description) errors[`condition_${i}_description`] = 'Description is required';
        if (!c.duration || c.duration <= 0) errors[`condition_${i}_duration`] = 'Duration must be positive';
      });
    }
    return errors;
  };

  const formik = useFormik({
    initialValues: { title:'', instruction:'', mediaUrl:'', mediaType:'', estimatedDuration:0, status:false, photo:'' },
    validate,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      const totalDuration = values.mediaType === 'camera'
        ? conditions.reduce((sum, c) => sum + (parseInt(c.duration,10)||0), 0)
        : parseInt(values.estimatedDuration||0,10);
      const exerciseData = {
        ...values,
        estimatedDuration: totalDuration,
        status: values.status,
        createdById: contentCreatorId,
        createdAt: createdAt,
      };
      try {
        await axios.put(`http://localhost:9999/api/exercise/${exerciseId}`, exerciseData);
        if(values.mediaType==='camera'){
          // 1️⃣ Lấy danh sách cũ
          const oldConditions = await axios.get(`http://localhost:9999/api/exercises/${exerciseId}/conditions`);
          
          // 2️⃣ Xóa từng condition
          for(const oc of oldConditions.data){
            await axios.delete(`http://localhost:9999/api/exercises/${exerciseId}/conditions/${oc.id}`);
          }
        
          // 3️⃣ Thêm condition mới
          for(const c of conditions){
            await axios.post(`http://localhost:9999/api/exercises/${exerciseId}/conditions`,{
              type: c.type,
              description: c.description,
              duration: parseInt(c.duration,10),
              stepOrder: c.stepOrder
            });
          }
        }
        
        Swal.fire({icon:'success',title:'✅ Updated',text:'Exercise updated successfully'});
        navigate('/contentCreator/exercise');
      } catch(error){
        Swal.fire({
          icon:'error',
          title:error.response?.status===400?'❌ Invalid Data':'❌ Server Error',
          text: error.response?.data?.message || JSON.stringify(error.response?.data)
        });
      }
    }
  });

  // Fetch exercise data
  useEffect(()=>{
    if(!exerciseId) return;
    const fetchData=async()=>{
      try{
        const res = await axios.get(`http://localhost:9999/api/exercise/${exerciseId}`);
        const e = res.data;
        formik.setValues({
          title:e.title||'',
          instruction:e.instruction||'',
          mediaUrl:e.mediaUrl||'',
          mediaType:e.mediaType||'',
          estimatedDuration:e.estimatedDuration||0,
          status:e.status===true||e.status==='true',
          photo:e.photo||''
        });
        setCreatedAt(e.createdAt);
        if(e.mediaType==='camera' && e.conditions?.length){
          setConditions(e.conditions.map(c=>({
            type:c.type||'',
            description:c.description||'',
            duration:c.duration||'',
            stepOrder:c.stepOrder||1
          })));
        }
      }catch(err){ console.error(err); Swal.fire({icon:'error',title:'Failed to load exercise'}); }
    };
    fetchData();
  },[exerciseId]);

  // Upload file
  const handleUpload = async (file, onSuccess=null) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try{
      const res = await axios.post('http://localhost:9999/api/upload',formData,{headers:{'Content-Type':'multipart/form-data'}});
      const url = res.data.url;
      if(file.type.startsWith('image/')){ if(onSuccess) onSuccess(url); }
      else{
        formik.setFieldValue('mediaUrl',url);
        const fileType=file.type.startsWith('audio')?'audio':'video';
        formik.setFieldValue('mediaType',fileType);
        const media = document.createElement(fileType);
        media.preload='metadata'; media.src=URL.createObjectURL(file);
        media.onloadedmetadata=()=>{ formik.setFieldValue('estimatedDuration',Math.floor(media.duration)); URL.revokeObjectURL(media.src); };
      }
    }catch{ Swal.fire({icon:'error',title:'Upload failed'}); }
    finally{ setUploading(false); }
  };

  // Condition handlers
  const addCondition=()=>setConditions([...conditions,{type:'',description:'',duration:'',stepOrder:conditions.length+1}]);
  const updateCondition=(i,f,v)=>{ const c=[...conditions]; c[i]={...c[i],[f]:v}; setConditions(c); };
  const removeCondition=(i)=>{ const c=conditions.filter((_,idx)=>idx!==i); c.forEach((v,idx)=>v.stepOrder=idx+1); setConditions(c); };

  useEffect(()=>{
    if(formik.values.mediaType==='camera' && conditions.length===0) addCondition();
    else if(formik.values.mediaType!=='camera') setConditions([]);
  },[formik.values.mediaType]);

  useEffect(()=>{
    if(formik.values.mediaType==='camera'){
      const total = conditions.reduce((sum,c)=>sum+(parseInt(c.duration,10)||0),0);
      formik.setFieldValue('estimatedDuration',total);
    }
  },[conditions]);

  return (
    <div className="container my-5" style={{maxWidth:'700px'}}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">✏️ Edit Exercise</h2>
          <form onSubmit={formik.handleSubmit}>
            {/* Title */}
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input type="text" name="title" className={`form-control ${formik.errors.title?'is-invalid':''}`} onChange={formik.handleChange} value={formik.values.title}/>
              {formik.errors.title && <div className="invalid-feedback">{formik.errors.title}</div>}
            </div>
            {/* Instruction */}
            <div className="mb-3">
              <label className="form-label">Instruction</label>
              <textarea name="instruction" rows="4" className={`form-control ${formik.errors.instruction?'is-invalid':''}`} onChange={formik.handleChange} value={formik.values.instruction}/>
              {formik.errors.instruction && <div className="invalid-feedback">{formik.errors.instruction}</div>}
            </div>
            {/* Media type */}
            <div className="mb-3">
              <label className="form-label">Media Type</label>
              <select name="mediaType" className="form-control" onChange={formik.handleChange} value={formik.values.mediaType}>
                <option value="">Select media type</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="camera">Camera</option>
              </select>
            </div>
            {/* Media upload */}
            {formik.values.mediaType!=='camera' && (
              <div className="mb-3">
                <label className="form-label">Media File (.mp3, .mp4)</label>
                <input type="file" className="form-control" onChange={e=>{const f=e.target.files[0]; if(f) handleUpload(f);}}/>
                {formik.values.mediaUrl && (
                  <div className="mt-2">
                    {formik.values.mediaType==='video' && <video controls src={formik.values.mediaUrl} style={{maxWidth:'100%', maxHeight:'200px'}}/>}
                    {formik.values.mediaType==='audio' && <audio controls src={formik.values.mediaUrl} style={{maxWidth:'100%'}}/>}
                  </div>
                )}
              </div>
            )}
            {/* Thumbnail */}
            <div className="mb-3">
              <label className="form-label">Thumbnail Image</label>
              <input type="file" className="form-control" onChange={e=>{const f=e.target.files[0];if(f) handleUpload(f,url=>formik.setFieldValue('photo',url))}}/>
              {formik.values.photo && <div className="mt-2 text-center"><img src={formik.values.photo} alt="Thumbnail" style={{maxHeight:'150px',borderRadius:'8px',objectFit:'cover'}}/></div>}
            </div>
            {/* Conditions */}
            {formik.values.mediaType==='camera' && (
              <div className="mb-3">
                <h4 className="text-primary">Exercise Conditions</h4>
                <p className="text-muted">Total Duration: {formik.values.estimatedDuration}s</p>
                {conditions.map((c,i)=>(
                  <div key={i} className="card mb-2 p-3">
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <label>Type</label>
                        <select className="form-control" value={c.type} onChange={e=>updateCondition(i,'type',e.target.value)}>
                          <option value="">Select</option>
                          {CONDITION_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label>Description</label>
                        <input type="text" className="form-control" value={c.description} onChange={e=>updateCondition(i,'description',e.target.value)}/>
                      </div>
                      <div className="col-md-2">
                        <label>Duration</label>
                        <input type="number" className="form-control" min={1} value={c.duration} onChange={e=>updateCondition(i,'duration',e.target.value)}/>
                      </div>
                      <div className="col-md-2">
                        <label>Step</label>
                        <input type="number" className="form-control" value={c.stepOrder} disabled/>
                      </div>
                      <div className="col-md-1 d-flex align-items-center justify-content-center">
                        <button type="button" className="btn btn-outline-danger" onClick={()=>removeCondition(i)} disabled={conditions.length===1}>❌</button>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary w-100" onClick={addCondition}>➕ Add Condition</button>
              </div>
            )}
            <button type="submit" className="btn btn-success w-100 mt-3">{uploading?'⏳ Uploading...':'💾 Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExercise;
