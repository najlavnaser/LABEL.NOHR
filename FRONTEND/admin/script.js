const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const toggleButton=document.querySelector(".input-toggle")


loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  console.log("Email:", email);
  console.log("Password:", password);

  try {
    const response = await fetch("http://127.0.0.1:3000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    console.log("Server Response:", data);

    if (data.success) {
  window.location.href = "dashboard.html";
}

  } catch (error) {
    console.error("Login Error:", error);
  }
});


/*-------show password--*/

toggleButton.addEventListener("click",()=>{
  if(passwordInput.type==="password"){
    passwordInput.type="text";
    toggleButton.classList.add("is-active");
    toggleButton.setAttribute("aria-label","Hide Password");
  }else{
    passwordInput.type="password";
    toggleButton.classList.remove("is-active")
    toggleButton.setAttribute("aria-label","Show password");
  }
});