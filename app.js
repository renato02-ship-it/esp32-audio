const fileInput=document.getElementById("fileInput");
const selectBtn=document.getElementById("selectBtn");
const dropZone=document.getElementById("dropZone");
const fileInfo=document.getElementById("fileInfo");
const preview=document.getElementById("preview");
const sendBtn=document.getElementById("sendBtn");
const progressArea=document.getElementById("progressArea");
const progressBar=document.getElementById("progressBar");
const progressText=document.getElementById("progressText");
const statusBox=document.getElementById("status");

let selectedFile=null;

selectBtn.onclick=()=>fileInput.click();
fileInput.onchange=()=>chooseFile(fileInput.files[0]);

["dragenter","dragover"].forEach(e=>dropZone.addEventListener(e,x=>{
  x.preventDefault();dropZone.classList.add("drag");
}));
["dragleave","drop"].forEach(e=>dropZone.addEventListener(e,x=>{
  x.preventDefault();dropZone.classList.remove("drag");
}));
dropZone.ondrop=e=>chooseFile(e.dataTransfer.files[0]);

function chooseFile(file){
  hideStatus();
  if(!file)return;
  if(!(file.type==="audio/mpeg"||file.name.toLowerCase().endsWith(".mp3"))){
    return showStatus("Debes seleccionar un archivo MP3.",false);
  }
  if(file.size>25*1024*1024){
    return showStatus("El archivo supera los 25 MB.",false);
  }
  selectedFile=file;
  fileInfo.textContent=`${file.name} · ${formatBytes(file.size)}`;
  fileInfo.classList.remove("hidden");
  preview.src=URL.createObjectURL(file);
  preview.classList.remove("hidden");
  sendBtn.disabled=false;
}

sendBtn.onclick=upload;

async function upload(){
  if(!selectedFile)return;
  sendBtn.disabled=true;
  progressArea.classList.remove("hidden");
  progress(5,"Preparando...");

  try{
    if(CONFIG.SUPABASE_URL==="PENDIENTE"||CONFIG.SUPABASE_ANON_KEY==="PENDIENTE"){
      throw new Error("La página está creada, pero todavía falta configurar Supabase.");
    }

    const id=crypto.randomUUID();
    const clean=selectedFile.name.normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-zA-Z0-9._-]/g,"_");
    const path=`mensajes/${id}-${clean}`;
    const base=CONFIG.SUPABASE_URL.replace(/\/$/,"");

    progress(20,"Subiendo MP3...");
    const r=await fetch(`${base}/storage/v1/object/${CONFIG.STORAGE_BUCKET}/${encodeURIComponent(path)}`,{
      method:"POST",
      headers:{
        Authorization:`Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        apikey:CONFIG.SUPABASE_ANON_KEY,
        "Content-Type":selectedFile.type||"audio/mpeg",
        "x-upsert":"false"
      },
      body:selectedFile
    });
    if(!r.ok)throw new Error("No se pudo subir el MP3 a Supabase.");

    const url=`${base}/storage/v1/object/public/${CONFIG.STORAGE_BUCKET}/${path}`;
    const message={
      device_id:CONFIG.DEVICE_ID,
      message_id:id,
      filename:clean,
      storage_path:path,
      url,
      created_at:new Date().toISOString()
    };

    progress(75,"MP3 subido. Avisando al ESP32...");

    if(CONFIG.NOTIFY_ENDPOINT==="PENDIENTE"){
      progress(100,"MP3 guardado.");
      showStatus("El MP3 se guardó correctamente. Falta configurar la notificación MQTT del ESP32.",true);
      return;
    }

    const notify=await fetch(CONFIG.NOTIFY_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(message)
    });
    if(!notify.ok)throw new Error("El MP3 se subió, pero no se pudo avisar al ESP32.");

    progress(100,"Mensaje enviado.");
    showStatus("Mensaje enviado correctamente al ESP32.",true);
  }catch(e){
    progress(0,"Error");
    showStatus(e.message||"Ocurrió un error.",false);
  }finally{
    sendBtn.disabled=false;
  }
}

function progress(v,t){progressBar.style.width=v+"%";progressText.textContent=t}
function showStatus(t,ok){
  statusBox.className="status "+(ok?"ok":"error");
  statusBox.textContent=t;statusBox.classList.remove("hidden")
}
function hideStatus(){statusBox.classList.add("hidden")}
function formatBytes(n){
  if(!n)return"0 B";
  const u=["B","KB","MB","GB"],i=Math.floor(Math.log(n)/Math.log(1024));
  return `${(n/1024**i).toFixed(i?1:0)} ${u[i]}`;
}
