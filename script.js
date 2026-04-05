/* =========================
   DATA
========================= */
let products = [];
let types = [];
let invoice = [];
let allInvoices = [];

try {
    products = JSON.parse(localStorage.getItem("products")) || [];
    types = JSON.parse(localStorage.getItem("types")) || ["جراب","شاحن"];
    allInvoices = JSON.parse(localStorage.getItem("allInvoices")) || [];
} catch(e){
    products = [];
    types = ["جراب","شاحن"];
    allInvoices = [];
}

/* =========================
   LOGIN
========================= */
function login(){
let user = document.getElementById("username")?.value.trim();
let pass = document.getElementById("password")?.value.trim();

if(user === "admin" && pass === "1234"){
    localStorage.setItem("loggedIn","true");
    localStorage.setItem("savedUser", user);
    location.reload();
}else{
    alert("بيانات غلط ❌");
}
}

function logout(){
    localStorage.removeItem("loggedIn");
    location.reload();
}

/* =========================
   NAV
========================= */
function go(page){
    window.location = page;
}

/* =========================
   ON LOAD
========================= */
window.onload = function(){

let isLogged = localStorage.getItem("loggedIn");

// التحكم في اللوجين
if(document.getElementById("loginBox") && document.getElementById("home")){

    if(isLogged === "true"){
        loginBox.style.display="none";
        home.style.display="block";
    } else {
        loginBox.style.display="block";
        home.style.display="none";
    }

}

// تذكر اليوزر
let savedUser = localStorage.getItem("savedUser");
if(savedUser && document.getElementById("username")){
    username.value = savedUser;
    password.focus();
}

// باقي الكود زي ما هو
loadTypes();
loadTypesToSale();
loadTypesSearch();

if(typeof renderProducts === "function"){
    renderProducts();
}

enableSearchInSelects();

}

/* =========================
   TYPES
========================= */
function loadTypes(){
if(!document.getElementById("type")) return;

type.innerHTML="";
types.forEach(t=>{
    type.innerHTML += `<option>${t}</option>`;
});

renderTypes();
}

function renderTypes(){
if(!document.getElementById("typesList")) return;

let html="";
types.forEach(t=>{
html += `
<div class="type-item">
    ${t}
    <span onclick="deleteType('${t}')" style="color:red;cursor:pointer">❌</span>
</div>`;
});

typesList.innerHTML = html;
}

function addNewType(){
let t = prompt("نوع الصنف؟");
if(t){
    types.push(t);
    localStorage.setItem("types", JSON.stringify(types));
    loadTypes();
}
}

function deleteType(t){
types = types.filter(x=>x!==t);
localStorage.setItem("types", JSON.stringify(types));
loadTypes();
}

/* =========================
   ADD PRODUCT
========================= */
function addProduct(){

let nameVal = document.getElementById("name")?.value.trim();
let costVal = document.getElementById("costPrice")?.value.trim();
let sellVal = document.getElementById("sellPrice")?.value.trim();
let quantityVal = document.getElementById("quantity")?.value.trim();
let barcodeVal = document.getElementById("barcode")?.value || "";
let typeVal = document.getElementById("type")?.value;

if(!nameVal || !costVal || !sellVal || !quantityVal){
    alert("املي البيانات ❌");
    return;
}

let product = {
    name: nameVal,
    cost: Number(costVal),
    price: Number(sellVal),
    quantity: Number(quantityVal),
    barcode: barcodeVal,
    type: typeVal
};

products.push(product);
localStorage.setItem("products", JSON.stringify(products));

console.log("تم الحفظ:", product);

alert("تم حفظ المنتج ✅🔥");

// تحديث البيع لو مفتوح
if(typeof loadProductsByType === "function"){
    loadProductsByType();
}
}

/* =========================
   SALE
========================= */
function loadTypesToSale(){
if(!document.getElementById("saleType")) return;

saleType.innerHTML="";
types.forEach(t=>{
    saleType.innerHTML += `<option>${t}</option>`;
});

loadProductsByType();
}

function loadProductsByType(){
if(!document.getElementById("productList")) return;

let filtered = products.filter(p=>p.type === saleType.value);

productList.innerHTML="";
filtered.forEach(p=>{
    productList.innerHTML += `<option>${p.name}</option>`;
});

showPrice();
}

function showPrice(){
let p = products.find(x=>x.name === productList.value);
if(p){
    salePrice.value = p.price;
}
}

function addToInvoice(){
let p = products.find(x=>x.name === productList.value);

if(!p || p.quantity <= 0){
    alert("مش موجود ❌");
    return;
}

if(p.quantity <= 2){
    alert("⚠ المنتج قرب يخلص");
}

p.quantity--;

invoice.push({
    name: p.name,
    price: Number(salePrice.value)
});

localStorage.setItem("products", JSON.stringify(products));

renderInvoice();
}

function deleteLastSale(){
invoice.pop();
renderInvoice();
}

function renderInvoice(){
if(!document.getElementById("invoiceList")) return;

let total = 0;
let html = "";

invoice.forEach(i=>{
    total += i.price;
    html += `<p>${i.name} - ${i.price}ج</p>`;
});

invoiceList.innerHTML = html;
totalText.innerText = "الإجمالي: " + total;
}

/* 💣 FIX الفاتورة */
function confirmSale(){
if(invoice.length === 0){
    alert("مفيش منتجات ❌");
    return;
}

// نسخة من الفاتورة
let invoiceCopy = JSON.parse(JSON.stringify(invoice));

allInvoices.push({
    items: invoiceCopy,
    time: new Date().toLocaleString()
});

localStorage.setItem("allInvoices", JSON.stringify(allInvoices));

// حفظ للطباعة
localStorage.setItem("lastInvoice", JSON.stringify(invoiceCopy));

invoice = [];

alert("تم البيع ✅");

window.location = "index.html";
}

/* =========================
   PRINT
========================= */
function openPrintPage(){
window.open("print.html");
}

/* =========================
   INVOICES
========================= */
function loadAllInvoices(){
let html = "";

allInvoices.forEach(inv=>{
    html += `<hr><h4>${inv.time}</h4>`;

    inv.items.forEach(i=>{
        html += `<p>${i.name} - ${i.price}ج</p>`;
    });
});

document.getElementById("invoice").innerHTML = html;
}

/* =========================
   STOCK PAGE
========================= */
function renderProducts(search=""){
if(!document.getElementById("productsList")) return;

let html = "";

products
.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()))
.forEach((p,i)=>{

html += `
<div style="background:#222;padding:10px;margin:5px;border-radius:8px">
<b>${p.name}</b><br>
💰 ${p.price} | 📦 ${p.quantity}<br>

<button onclick="editProduct(${i})">✏️ تعديل</button>
<button onclick="deleteProduct(${i})">❌ حذف</button>
</div>
`;
});

productsList.innerHTML = html;
}

function deleteProduct(i){
products.splice(i,1);
localStorage.setItem("products", JSON.stringify(products));
renderProducts();
}

function editProduct(i){
let p = products[i];

let newName = prompt("اسم المنتج", p.name);
let newPrice = prompt("السعر", p.price);
let newQty = prompt("الكمية", p.quantity);

if(newName && newPrice && newQty){
    p.name = newName;
    p.price = Number(newPrice);
    p.quantity = Number(newQty);

    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
}
}

/* =========================
   SEARCH PAGE
========================= */
function loadTypesSearch(){
if(!document.getElementById("searchType")) return;

searchType.innerHTML = `<option value="">الكل</option>`;

types.forEach(t=>{
    searchType.innerHTML += `<option>${t}</option>`;
});
}

function searchProducts(val){
let filtered = products.filter(p=>
(p.name.includes(val) || p.barcode == val) &&
(searchType.value ? p.type === searchType.value : true)
);

let html="";
filtered.forEach(p=>{
    html += `<p>${p.name} - ${p.price}ج</p>`;
});

results.innerHTML = html;
}

/* =========================
   PROFIT
========================= */
function showProfit(){

let profit = 0;

allInvoices.forEach(inv=>{
    inv.items.forEach(i=>{
        let p = products.find(x=>x.name === i.name);
        if(p){
            profit += (i.price - p.cost);
        }
    });
});

alert("صافي الربح: " + profit + "ج 💰");
}

/* =========================
   SEARCH IN SELECT 🔥
========================= */
function enableSearchInSelects(){

document.querySelectorAll("select").forEach(select=>{

let input = document.createElement("input");
input.placeholder = "🔍 اكتب للبحث...";
input.style.marginBottom="5px";

select.parentNode.insertBefore(input, select);

input.addEventListener("keyup", function(){
let val = this.value.toLowerCase();

[...select.options].forEach(o=>{
o.style.display = o.text.toLowerCase().includes(val) ? "" : "none";
});
});

});

}