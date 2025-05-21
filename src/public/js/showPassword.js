function myFunction() {
    var x = document.getElementById("password_hash");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }
  
  function showPassword() {
    var current_password = document.getElementById("password_hash");
    var new_password = document.getElementById("new_password_hash");
    var confirm_new_password = document.getElementById(
      "confirm_new_password_hash"
    );
    const fields = [current_password, new_password, confirm_new_password];
  
    fields.forEach((x) => {
      if (x.type === "password") {
        x.type = "text";
      } else {
        x.type = "password";
      }
    });
  }
  
  function show2Password() {
    var new_password = document.getElementById("new_password_hash");
    var confirm_new_password = document.getElementById(
      "confirm_new_password_hash"
    );
    const fields = [new_password, confirm_new_password];
  
    fields.forEach((x) => {
      if (x.type === "password") {
        x.type = "text";
      } else {
        x.type = "password";
      }
    });
  }
  