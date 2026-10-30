const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const detailName = document.getElementById("detailName");
const detailPhone = document.getElementById("detailPhone");
const securityEmail = document.getElementById("securityEmail");
const detailGender = document.getElementById("detailGender");

async function loadProfile() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/user/profile", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    console.log("Profile response:", data);

    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }
    if (!response.ok || !data.success) {
      console.error(data.message);
      return;
    }

    const user = data.user;
    if (profileName) {
      profileName.textContent = user.name || "User";
    }
    if (profileEmail) {
      profileEmail.textContent = user.email || "Not Added";
    }
    if (detailName) {
      detailName.textContent = user.name || "Not Added";
    }
    if (detailPhone) {
      detailPhone.textContent = user.phone || "Not added";
    }
    if (detailGender) {
      detailGender.textContent = user.gender || "Not Added";
    }
    if (securityEmail) {
      securityEmail.textContent = user.email || "Not Added";
    }
    const profileImage = document.getElementById("profile-img");
    if (profileImage && user.profileImage) {
      profileImage.src = user.profileImage;
    }
  } catch (error) {
    console.error("Profile loading error:", error);
  }
}

loadProfile();

//logout

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:3000/api/user/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.replace("login.html");
      } else {
        console.error("Logout failed:", data.message);
        alert(data.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to connect to the server. Please try again.");
    }
  });
}
