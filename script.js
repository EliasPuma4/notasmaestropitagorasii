
let profesores = [
    {usuario:'profesor1', password:'1234'},
    {usuario:'profesor2', password:'1234'}
];
let notas = [];
let autocompleteList = [];

function loginProfesor(){
    const usuario = document.getElementById('prof-usuario').value;
    const password = document.getElementById('prof-password').value;
    const loginMsg = document.getElementById('login-msg');
    const profesor = profesores.find(p => p.usuario===usuario && p.password===password);
    if(profesor){
        loginMsg.textContent = "Login exitoso";
        document.getElementById('subir-notas').style.display = 'block';
        document.getElementById('profesor-login').style.display = 'none';
    } else {
        loginMsg.textContent = "Usuario o contraseña incorrectos";
    }
}

function procesarExcel(){
    const file = document.getElementById('excel-file').files[0];
    if(!file) return alert('Seleccione un archivo Excel');
    const reader = new FileReader();
    reader.onload = function(e){
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data,{type:'array'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        notas = XLSX.utils.sheet_to_json(sheet);
        autocompleteList = notas.map(n => ({nombre:n.Nombre, carnet:n.Carnet}));
        alert('Notas cargadas exitosamente');
        document.getElementById('busqueda-estudiante').style.display = 'block';
        document.getElementById('subir-notas').style.display = 'none';
    }
    reader.readAsArrayBuffer(file);
}

function autocompletar(){
    const input = document.getElementById('busqueda').value.toLowerCase();
    const sugerencias = document.getElementById('sugerencias');
    sugerencias.innerHTML = '';
    const resultados = autocompleteList.filter(a => a.nombre.toLowerCase().includes(input) || a.carnet.toLowerCase().includes(input));
    resultados.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r.nombre + ' ('+r.carnet+')';
        li.onclick = ()=> generarPDF(r.carnet);
        sugerencias.appendChild(li);
    });
}

function generarPDF(carnet){
    const estudiante = notas.find(n => n.Carnet===carnet);
    if(!estudiante) return alert('Estudiante no encontrado');
    const {{ jsPDF }} = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Unidad Educativa Plena Maestro Pitágoras II", 105, 20, null, null, "center");
    doc.text("Nivel Secundario", 105, 30, null, null, "center");
    doc.addImage('assets/logo.png','PNG',160,10,40,40);
    doc.setFontSize(12);
    doc.text('Nombre: '+estudiante.Nombre, 20, 60);
    doc.text('Carnet: '+estudiante.Carnet, 20, 70);
    doc.text('Trimestre: '+(estudiante.Trimestre || 'Primero'), 20, 80);
    
    let y = 100;
    doc.text('Notas:', 20, y);
    y +=10;
    for(const key in estudiante){
        if(key!=='Nombre' && key!=='Carnet' && key!=='Trimestre'){
            doc.text(key + ': ' + estudiante[key], 25, y);
            y+=10;
        }
    }
    doc.save(estudiante.Nombre+'_'+estudiante.Carnet+'.pdf');
}
