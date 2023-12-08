function toggleIndexMenus(obj) {
    const subMenus = document.getElementsByClassName('navigation-submenu');   
    
    for (menu of subMenus) {
      menu.classList.remove("active");
    }
  
    if (!obj.nextElementSibling)
      return;
  
    if (obj.nextElementSibling.classList.contains("navigation-submenu"))
      obj.nextElementSibling.classList.add("active");
  }
  