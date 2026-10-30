const API_URL = "/api/user";

//password visibility

function setupPasswordToggle(inputId, buttonId) {
  const passwordInput = document.getElementById(inputId);
  const toggleButton = document.getElementById(buttonId);

  if (!passwordInput || !toggleButton) return;

  const eyeIcon = toggleButton.querySelector("i");

  toggleButton.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    if (eyeIcon) {
      eyeIcon.classList.toggle("fa-eye", !isHidden);
      eyeIcon.classList.toggle("fa-eye-slash", isHidden);
    }

    toggleButton.setAttribute(
      "aria-label",
      isHidden ? "Hide password" : "Show password",
    );
  });
}

setupPasswordToggle("password", "togglePass");
setupPasswordToggle("password", "togglePassword");
setupPasswordToggle("confirmPassword", "toggleConfirmPassword");

//login

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
      showMessage("Please enter your email and password.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage(data.message || "Login failed.");
        return;
      }

      showMessage("Login successful!", false);
      console.log("LOGIN RESPONSE RECEIVED");
    } catch (error) {
      console.error("Login error:", error);
      showMessage("Unable to connect to the server. Please try again.");
    }
  });
}

//signup

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    if (!name || !email || !password) {
      showMessage("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordPattern.test(password)) {
      showMessage(
        "Password must have at least 8 characters, including uppercase, lowercase, a number, and a special character.",
      );
      return;
    }

    const signupData = { name, email, password, confirmPassword };

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage(data.message || "Signup failed.");
        return;
      }

      sessionStorage.setItem("verificationEmail", email);

      showMessage(
        data.message || "Signup successful. Please verify your email.",
        false,
      );

      window.location.href = "otp.html";
    } catch (error) {
      console.error("Signup error:", error);
      showMessage("Unable to connect to the server. Please try again.");
    }
  });
}

//OTP verification

const verifyOTPForm = document.getElementById("verifyOTPForm");

if (verifyOTPForm) {
  verifyOTPForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email =
      document.getElementById("email")?.value.trim() ||
      sessionStorage.getItem("verificationEmail");

    const otp = document.getElementById("otp-input")?.value.trim();

    if (!email || !otp) {
      showMessage("Please enter your email and OTP.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log("OTP verification response:", data);

      if (!response.ok || !data.success) {
        showMessage(data.message || "OTP verification failed.");
        return;
      }

      sessionStorage.removeItem("verificationEmail");

      showMessage("Email verified successfully!", false);
      window.location.href = "login.html";
    } catch (error) {
      console.error("OTP verification error:", error);
      showMessage("Unable to verify OTP. Please try again.");
    }
  });
}

//Resend OTP

const resendOTPButton = document.getElementById("resendOTP");

if (resendOTPButton) {
  resendOTPButton.addEventListener("click", async () => {
    const email =
      document.getElementById("email")?.value.trim() ||
      sessionStorage.getItem("verificationEmail");

    if (!email) {
      showMessage("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showMessage(data.message || "Unable to resend OTP.");
        return;
      }

      showMessage(data.message || "A new OTP has been sent.", false);
    } catch (error) {
      console.error("Resend OTP error:", error);
      showMessage("Unable to connect to the server.");
    }
  });
}

//Google Login

window.handleGoogleLogin = async function (response) {
  await googleAuthentication(response);
};

window.handleGoogleSignup = async function (response) {
  await googleAuthentication(response);
};

async function googleAuthentication(googleResponse) {
  if (!googleResponse?.credential) {
    showMessage("Google authentication failed. Please try again.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        credentials: googleResponse.credential,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showMessage(data.message || "Google authentication failed.");
      return;
    }

    window.location.href = "/";
  } catch (error) {
    console.error("Google authentication error:", error);
    showMessage("Unable to connect to the server.");
  }
}

const formMessage = document.getElementById("formMessage");

function showMessage(message, isError = true) {
  if (formMessage) {
    formMessage.textContent = message;
    formMessage.style.color = isError ? "red" : "green";
  } else {
    alert(message);
  }
}

//login status

async function checkLoginStatus() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      //window.location.replace("homepage.html");
      console.log("User is already logged in");
    }
  } catch (error) {
    console.error("Could not check login status:", error);
  }
}

checkLoginStatus();
