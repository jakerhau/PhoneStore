const sidebar = document.querySelector("aside");
const maxSidebar = document.querySelector(".max-sidebar");
const miniSidebar = document.querySelector(".mini-sidebar");
const maxToolbar = document.querySelector(".max-toolbar");
const logo = document.querySelector(".logo");
const content = document.querySelector(".content");
const subMenu = document.getElementById("subMenu");
const roundout = document.querySelector(".roundout");
const moon = document.querySelector(".moon");

function toggleMenu() {
  subMenu.classList.toggle("max-h-0");
  subMenu.classList.toggle("max-h-[400px]");
  subMenu.classList.toggle("border");
  subMenu.classList.toggle("border-neutral-4");
}

function openNav() {
  const isMiniSidebar = sidebar.classList.contains("-translate-x-48");

  if (isMiniSidebar) {
    // Mở max sidebar
    sidebar.classList.remove("-translate-x-48");
    sidebar.classList.add("translate-x-none");
    maxSidebar.classList.remove("hidden");
    maxSidebar.classList.add("flex");
    miniSidebar.classList.remove("flex");
    miniSidebar.classList.add("hidden");
    maxToolbar.classList.add("translate-x-0");
    maxToolbar.classList.remove("translate-x-24", "scale-x-0");
    logo.classList.remove("ml-12");
    content.style.marginLeft = "240px"; 
  } else {
    // Chuyển sang mini sidebar
    sidebar.classList.add("-translate-x-48");
    sidebar.classList.remove("translate-x-none");
    maxSidebar.classList.add("hidden");
    maxSidebar.classList.remove("flex");
    miniSidebar.classList.add("flex");
    miniSidebar.classList.remove("hidden");
    maxToolbar.classList.add("translate-x-24", "scale-x-0");
    maxToolbar.classList.remove("translate-x-0");
    logo.classList.add("ml-12");
    content.style.marginLeft = "48px"; 
  }
}
