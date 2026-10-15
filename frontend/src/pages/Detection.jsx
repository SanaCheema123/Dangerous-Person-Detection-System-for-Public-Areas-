import { useEffect, useRef, useState } from "react";
import { Upload, Image as ImageIcon, Video, Monitor, SlidersHorizontal, Play, X, AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import detectionHero from "../assets/detection-hero.png";
import { backendFile, predictImage, predictVideo } from "../services/api";
import { addHistory } from "../services/history";
import "./Detection.css";

function HudCorners(){return <><span className="d-hud-corner d-tl"/><span className="d-hud-corner d-tr"/><span className="d-hud-corner d-bl"/><span className="d-hud-corner d-br"/></>}

function ImageResult({src,result,showBoxes}){
  const imgRef=useRef(null); const canvasRef=useRef(null);
  useEffect(()=>{
    const draw=()=>{const img=imgRef.current,c=canvasRef.current;if(!img||!c)return;const r=img.getBoundingClientRect();c.width=r.width;c.height=r.height;const ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);if(!showBoxes||!result?.detections)return;const sx=r.width/result.image.width,sy=r.height/result.image.height;result.detections.forEach(d=>{const b=d.bbox;const danger=d.class_id===1;ctx.strokeStyle=danger?"#ff3b4f":"#17b890";ctx.fillStyle=danger?"#ff3b4f":"#17b890";ctx.lineWidth=3;ctx.strokeRect(b.x1*sx,b.y1*sy,(b.x2-b.x1)*sx,(b.y2-b.y1)*sy);const label=`${danger?"Potentially Dangerous":"Normal"} ${Math.round(d.confidence*100)}%`;ctx.font="600 13px Arial";const w=ctx.measureText(label).width+12;const y=Math.max(20,b.y1*sy);ctx.fillRect(b.x1*sx,y-20,w,20);ctx.fillStyle="#fff";ctx.fillText(label,b.x1*sx+6,y-5);});};
    const ro=new ResizeObserver(draw);if(imgRef.current)ro.observe(imgRef.current);draw();return()=>ro.disconnect();
  },[result,showBoxes]);
  return <div className="real-image-result"><img ref={imgRef} src={src} onLoad={()=>window.dispatchEvent(new Event("resize"))} alt="Detection result"/><canvas ref={canvasRef}/></div>
}


function ProcessedVideoResult({ downloadUrl }) {
  const [videoSrc, setVideoSrc] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);

  useEffect(() => {
    let objectUrl = "";
    const controller = new AbortController();
    const loadProcessedVideo = async () => {
      setPreviewLoading(true);
      setPreviewError("");
      try {
        const response = await fetch(backendFile(downloadUrl), { signal: controller.signal });
        if (!response.ok) throw new Error(`Processed video request failed (${response.status})`);
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(new Blob([blob], { type: "video/mp4" }));
        setVideoSrc(objectUrl);
      } catch (error) {
        if (error.name !== "AbortError") setPreviewError(error.message);
      } finally {
        setPreviewLoading(false);
      }
    };
    if (downloadUrl) loadProcessedVideo();
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [downloadUrl]);

  return <div className="processed-video-result">
    {previewLoading && <div className="video-preview-state"><LoaderCircle className="spin"/><strong>Loading processed result...</strong></div>}
    {videoSrc && !previewError && <video
      className="result-video"
      src={videoSrc}
      controls
      playsInline
      preload="auto"
      onLoadedData={() => setPreviewLoading(false)}
      onError={() => setPreviewError("The processed MP4 was created, but this browser cannot decode its video codec.")}
    />}
    {previewError && <div className="video-preview-state video-preview-error"><AlertTriangle/><strong>Browser preview unavailable</strong><span>{previewError}</span><span>The backend output must use a browser-compatible H.264 MP4 codec for inline preview.</span></div>}
  </div>;
}

export default function Detection(){
 const imageInputRef=useRef(null),videoInputRef=useRef(null);const [selectedFile,setSelectedFile]=useState(null),[preview,setPreview]=useState(null),[fileType,setFileType]=useState(null),[confidence,setConfidence]=useState(25),[showBoxes,setShowBoxes]=useState(true),[loading,setLoading]=useState(false),[result,setResult]=useState(null),[error,setError]=useState("");
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 const selectFile=file=>{if(!file)return;const image=file.type.startsWith("image/"),video=file.type.startsWith("video/");if(!image&&!video){setError("Select a supported image or video.");return}if(preview)URL.revokeObjectURL(preview);setSelectedFile(file);setFileType(image?"image":"video");setPreview(URL.createObjectURL(file));setResult(null);setError("")};
 const removeFile=()=>{if(preview)URL.revokeObjectURL(preview);setSelectedFile(null);setPreview(null);setFileType(null);setResult(null);setError("");if(imageInputRef.current)imageInputRef.current.value="";if(videoInputRef.current)videoInputRef.current.value=""};
 const runDetection=async()=>{if(!selectedFile)return setError("Select an image or video first.");setLoading(true);setError("");setResult(null);try{const data=fileType==="image"?await predictImage(selectedFile,confidence/100):await predictVideo(selectedFile,confidence/100);setResult(data);const summary=data.summary||{};addHistory({id:crypto.randomUUID(),timestamp:new Date().toISOString(),mediaType:fileType,filename:selectedFile.name,normal:summary.normal_detections??summary.normal_tracks??data.normal_tracks??0,dangerous:summary.potentially_dangerous_detections??summary.potentially_dangerous_tracks??data.potentially_dangerous_tracks??0,total:summary.total_detections??data.detections_count??data.total_frame_detections??0,confidence,downloadUrl:data.download_url||null});}catch(e){setError(e.message+". Make sure the FastAPI backend is running on port 8000.")}finally{setLoading(false)}};
 const s=result?.summary||{};const normal=s.normal_detections??s.normal_tracks??result?.normal_tracks??0,danger=s.potentially_dangerous_detections??s.potentially_dangerous_tracks??result?.potentially_dangerous_tracks??0,total=s.total_detections??result?.detections_count??result?.total_frame_detections??0;
 return <div className="detection-page"><Navbar/>
  <section className="detection-hero"><div className="detection-grid-bg"/><div className="detection-hero-container"><div className="detection-heading"><p className="detection-eyebrow">AI-POWERED ANALYSIS</p><h1 className="detection-glitch-title" data-text="DETECTION">DETECTION</h1><div className="detection-intro">Analyze images and videos with the trained YOLO11n model and review person-level bounding boxes and confidence scores.</div></div><div className="detection-hero-visual"><div className="detection-glow"/><img src={detectionHero} alt="AI detection analysis"/></div></div></section>
  <section className="detection-workspace"><div className="detection-workspace-container">
   <article className="detection-panel upload-media-panel"><HudCorners/><div className="d-panel-title"><Upload/><span>UPLOAD MEDIA</span></div><div className={`drop-zone ${selectedFile?"has-file":""}`} onDrop={e=>{e.preventDefault();selectFile(e.dataTransfer.files?.[0])}} onDragOver={e=>e.preventDefault()}>{!selectedFile?<><div className="upload-cloud"><Upload/></div><h2>Drag & drop your image or video here</h2><p>JPG, JPEG, PNG, WEBP, MP4, AVI, MOV, MKV</p><div className="media-buttons"><button className="select-image-btn" onClick={()=>imageInputRef.current?.click()}><ImageIcon/>SELECT IMAGE</button><button className="select-video-btn" onClick={()=>videoInputRef.current?.click()}><Video/>SELECT VIDEO</button></div></>:<div className="selected-file"><button className="remove-file" onClick={removeFile}><X/></button>{fileType==="image"?<img src={preview} alt="Selected input"/>:<video src={preview} controls muted/>}<div className="selected-file-info"><strong>{selectedFile.name}</strong><span>{(selectedFile.size/1048576).toFixed(2)} MB</span></div></div>}<input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>selectFile(e.target.files?.[0])}/><input ref={videoInputRef} type="file" accept="video/mp4,video/avi,video/quicktime,video/x-matroska" hidden onChange={e=>selectFile(e.target.files?.[0])}/></div></article>
   <article className="detection-panel analysis-panel"><HudCorners/><div className="d-panel-header"><div className="d-panel-title"><Monitor/><span>ANALYSIS RESULT</span></div><div className="ready-status"><i/>{loading?"PROCESSING":result?"COMPLETED":"READY"}</div></div><div className="analysis-content">{loading?<div className="empty-analysis"><LoaderCircle className="spin"/><h2>Running YOLO11n inference</h2><p>Video processing on CPU can take time.</p></div>:result?(fileType==="image"?<ImageResult src={preview} result={result} showBoxes={showBoxes}/>:<ProcessedVideoResult downloadUrl={result.download_url}/>):selectedFile?<div className="waiting-analysis">{fileType==="image"?<img src={preview} alt="Ready"/>:<video src={preview} muted/>}<div className="waiting-overlay"><Play/><strong>MEDIA READY</strong><span>Press Run Detection</span></div></div>:<div className="empty-analysis"><ImageIcon/><h2>No media analyzed yet</h2><p>Upload media to begin.</p></div>}</div>{result&&<div className="real-summary"><div><CheckCircle2/><span>Normal</span><strong>{normal}</strong></div><div className={danger?"danger":""}><AlertTriangle/><span>Potentially Dangerous</span><strong>{danger}</strong></div><div><Monitor/><span>{fileType==="video"?"Frame Detections":"Total Detections"}</span><strong>{total}</strong></div>{fileType==="video"&&result.download_url&&<a href={backendFile(result.download_url)} target="_blank" rel="noreferrer">DOWNLOAD PROCESSED VIDEO</a>}</div>}{error&&<div className="api-error">{error}</div>}</article>
   <aside className="detection-panel detection-settings"><HudCorners/><div className="d-panel-title"><SlidersHorizontal/><span>DETECTION SETTINGS</span></div><div className="settings-content"><div className="setting-block"><div className="setting-label"><span>Confidence Threshold</span><strong>{confidence}%</strong></div><input className="confidence-slider" type="range" min="10" max="90" value={confidence} onChange={e=>setConfidence(Number(e.target.value))} style={{"--range-progress":`${confidence}%`}}/></div><div className="setting-block"><label>Model</label><div className="model-readonly">YOLO11n Hard-Negative V2 · CPU</div></div><div className="toggle-setting"><span>Show Bounding Boxes</span><button type="button" className={`d-toggle ${showBoxes?"enabled":""}`} onClick={()=>setShowBoxes(v=>!v)}><i/></button></div><button className="run-detection-btn" disabled={loading||!selectedFile} onClick={runDetection}>{loading?<LoaderCircle className="spin"/>:<Play/>}{loading?"PROCESSING...":"RUN DETECTION"}</button></div></aside>
  </div></section>
 </div>
}
