const API_URL = "http://127.0.0.1:3000/api/user/profile";
const profileImg = document.getElementById("profile-img");
const imageInput = document.getElementById("file-input");
const nameInput = document.getElementById("detailName");
const phoneInput = document.getElementById("detailPhone");
const genderMale = document.getElementById("genderMale");
const genderFemale = document.getElementById("genderFemale");
const saveButton = document.getElementById("saveProfileBtn");
let editingAddressId = null;
let selectedImage = null;

async function loadProfile() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Please log in again.");
      return;
    }

    const user = data.user;
    nameInput.value = user.name || "";
    phoneInput.value = user.phone || "";
    genderMale.checked = user.gender === "Male";
    genderFemale.checked = user.gender === "Female";
    document.getElementById("profileName").textContent = user.name || "User";

    document.getElementById("profileEmail").textContent =
      user.email || "Not Added";

    document.getElementById("securityEmail").textContent =
      user.email || "Not Added";

    if (user.profileImage && profileImg) {
      profileImg.src = user.profileImage;
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    alert("Unable to load profile. Please try again.");
  }
}

//upload image

function previewImage(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image.");
    imageInput.value = "";
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("Image size must be less than 5 MB! ");
    imageInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    selectedImage = reader.result;
    profileImg.src = selectedImage;
  };

  reader.readAsDataURL(file);
}

//save profile changes

saveButton.addEventListener("click", async function () {
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  let gender = "";
  if (genderMale.checked) {
    gender = "Male";
  } else if (genderFemale.checked) {
    gender = "Female";
  }

  if (!name) {
    alert("Please enter your full name.");
    nameInput.focus();
    return;
  }

  saveButton.disabled = true;

  try {
    const updatedProfile = {
      name: name,
      phone: phone,
      gender: gender,
    };
    if (selectedImage !== null) {
      updatedProfile.profileImage = selectedImage;
    }

    const response = await fetch(API_URL, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProfile),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Failed to save profile.");
      return;
    }

    // document.getElementById("profileName").textContent = name;

    alert("Profile updated successfully!");

    window.location.href = "profile.html";
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Unable to save changes. Please try again.");
  } finally {
    saveButton.disabled = false;
  }
});

loadProfile();

//email change
const changeEmailBtn = document.getElementById("changeEmailBtn");
const emailChangeSection = document.getElementById("emailChangeSection");

const newEmailInput = document.getElementById("newEmail");
const sendEmailOtpBtn = document.getElementById("sendEmailOtpBtn");

const otpSection = document.getElementById("otpSection");
const emailChangeOtp = document.getElementById("emailChangeOtp");
const verifyEmailOtpBtn = document.getElementById("verifyEmailOtpBtn");

const emailChangeMessage = document.getElementById("emailChangeMessage");

// Show or hide the email change form
changeEmailBtn.addEventListener("click", () => {
  emailChangeSection.style.display =
    emailChangeSection.style.display === "none" ? "block" : "none";
});

//Email change

sendEmailOtpBtn.addEventListener("click", async () => {
  const newEmail = newEmailInput.value.trim();

  if (!newEmail) {
    emailChangeMessage.textContent = "Please enter your new email address.";
    return;
  }

  try {
    emailChangeMessage.textContent = "Sending OTP...";

    const response = await fetch(
      "http://127.0.0.1:3000/api/user/request-email-change",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ newEmail }),
      },
    );

    const data = await response.json();

    if (response.ok && data.success) {
      emailChangeMessage.textContent = data.message;
      otpSection.style.display = "block";
    } else {
      emailChangeMessage.textContent = data.message || "Unable to send OTP.";
    }
  } catch (error) {
    console.error("Email change request error:", error);
    emailChangeMessage.textContent =
      "Unable to connect to the server. Please try again.";
  }
});

//verify email
verifyEmailOtpBtn.addEventListener("click", async () => {
  const otp = emailChangeOtp.value.trim();

  if (!otp) {
    emailChangeMessage.textContent = "Please enter the OTP.";
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    emailChangeMessage.textContent = "Please enter a valid OTP.";
    return;
  }

  try {
    emailChangeMessage.textContent = "Verifying OTP...";

    const response = await fetch(
      "http://127.0.0.1:3000/api/user/verify-email-change",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ otp }),
      },
    );

    const data = await response.json();

    if (response.ok && data.success) {
      document.getElementById("securityEmail").textContent = data.user.email;

      emailChangeSection.style.display = "none";
      otpSection.style.display = "none";

      newEmailInput.value = "";
      emailChangeOtp.value = "";

      alert(data.message);
    } else {
      emailChangeMessage.textContent =
        data.message || "OTP verification failed.";
    }
  } catch (error) {
    console.error("Email verification error:", error);
    emailChangeMessage.textContent =
      "Unable to connect to the server. Please try again.";
  }
});

//password change

const changePasswordBtn = document.getElementById("changePasswordBtn");
const passwordChangeSection = document.getElementById("passwordChangeSection");

if (changePasswordBtn && passwordChangeSection) {
  changePasswordBtn.addEventListener("click", () => {
    const isHidden =
      window.getComputedStyle(passwordChangeSection).display === "none";

    passwordChangeSection.style.display = isHidden ? "block" : "none";
  });
}

const savePasswordBtn = document.getElementById("savePasswordBtn");

const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
const passwordChangeMessage = document.getElementById("passwordChangeMessage");

savePasswordBtn.addEventListener("click", async () => {
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    passwordChangeMessage.textContent = "Please fill in all password fields.";
    return;
  }

  if (newPassword !== confirmNewPassword) {
    passwordChangeMessage.textContent = "New passwords do not match.";
    return;
  }

  try {
    passwordChangeMessage.textContent = "Updating password...";

    const response = await fetch(
      "http://127.0.0.1:3000/api/user/change-password",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      },
    );

    const data = await response.json();

    if (response.ok && data.success) {
      passwordChangeMessage.textContent = data.message;

      currentPasswordInput.value = "";
      newPasswordInput.value = "";
      confirmNewPasswordInput.value = "";

      passwordChangeSection.style.display = "none";
    } else {
      passwordChangeMessage.textContent =
        data.message || "Unable to update password.";
    }
  } catch (error) {
    console.error("Change password error:", error);
    passwordChangeMessage.textContent =
      "Unable to connect to the server. Please try again.";
  }
});

document.querySelectorAll(".password-toggle").forEach((toggleBtn) => {
  toggleBtn.addEventListener("click", () => {
    const targetId = toggleBtn.dataset.target;
    const passwordInput = document.getElementById(targetId);

    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    toggleBtn.setAttribute(
      "aria-label",
      `${isHidden ? "Hide" : "Show"} ${
        targetId === "currentPassword"
          ? "current password"
          : targetId === "newPassword"
            ? "new password"
            : "confirmation password"
      }`,
    );

    toggleBtn.setAttribute("aria-pressed", String(isHidden));
  });
});

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
        window.location.href = "login.html";
      } else {
        alert(data.message || "Unable to log out. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to connect to the server. Please try again.");
    }
  });
}

//add address

const addAddressBtn = document.getElementById("addAddressBtn");
const addressFormContainer = document.getElementById("addressFormContainer");
const addressForm = document.getElementById("addressForm");
const addressFormTitle = document.getElementById("addressFormTitle");
const cancelAddressBtn = document.getElementById("cancelAddressBtn");
const addressFormMessage = document.getElementById("addressFormMessage");

addAddressBtn.addEventListener("click", () => {
  editingAddressId = null;
  addressForm.reset();

  addressFormTitle.textContent = "Add New Address";
  addressFormMessage.textContent = "";

  addressFormContainer.hidden = false;
  addressFormContainer.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
});

//save address

addressForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  addressFormMessage.textContent = "Saving address...";

  const addressData = {
    label: document.getElementById("addressLabel").value.trim(),
    fullName: document.getElementById("addressName").value.trim(),
    phone: document.getElementById("addressPhone").value.trim(),
    address: document.getElementById("addressText").value.trim(),
    isDefault: document.getElementById("addressDefault").checked,
  };

  try {
    const url = editingAddressId
      ? `http://127.0.0.1:3000/api/user/addresses/${editingAddressId}`
      : "http://127.0.0.1:3000/api/user/addresses";

    const response = await fetch(url, {
      method: editingAddressId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(addressData),
    });

    const data = await response.json();

    if (!response.ok) {
      addressFormMessage.textContent =
        data.message || "Failed to save address.";
      return;
    }

    addressFormMessage.textContent = data.message;

    addressForm.reset();
    addressFormContainer.hidden = true;
    editingAddressId = null;

    await loadAddresses();

    alert("Address saved successfully!");
  } catch (error) {
    console.error("Save Address Error:", error);
    addressFormMessage.textContent =
      "Unable to connect to the server. Please try again.";
  }
});







//show address

const addressList = document.getElementById("addressList");

async function loadAddresses() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/user/addresses", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      addressList.textContent = data.message || "Unable to load addresses.";
      return;
    }

    addressList.replaceChildren();

    if (!data.addresses || data.addresses.length === 0) {
      addressList.textContent = "No saved addresses yet.";
      return;
    }

    data.addresses.forEach((address) => {
      const card = document.createElement("article");
      card.className = "card address";

      if (address.isDefault) {
        card.classList.add("is-default");
      }

      const header = document.createElement("header");
      header.className = "card-head";

      const title = document.createElement("h3");
      title.className = "addr-title";

      const icon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      icon.setAttribute("class", "icon");

      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");

      use.setAttribute(
        "href",
        address.label.toLowerCase() === "work" ? "#i-building" : "#i-home",
      );

      icon.appendChild(use);
      title.append(icon, document.createTextNode(" " + address.label));

      const badge = document.createElement("span");
      badge.className = address.isDefault
        ? "badge badge-dark"
        : "badge badge-grey";

      badge.textContent = address.isDefault
        ? "Default shipping"
        : address.label;

      header.append(title, badge);

      const addressElement = document.createElement("address");

      const fullName = document.createElement("strong");
      fullName.textContent = address.fullName;

      addressElement.append(fullName, document.createTextNode(address.address));

      const phone = document.createElement("p");
      phone.className = "phone";

      const phoneIcon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      phoneIcon.setAttribute("class", "icon icon-xs");

      const phoneUse = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "use",
      );
      phoneUse.setAttribute("href", "#i-phone");
      phoneIcon.appendChild(phoneUse);

      phone.append(phoneIcon, document.createTextNode(" " + address.phone));

      const footer = document.createElement("footer");
      footer.className = "addr-actions";

      //edit button
      const editBtn = document.createElement("button");
      editBtn.className = "link-btn";
      editBtn.type = "button";
      editBtn.innerHTML = `
  <svg class="icon icon-xs">
    <use href="#i-pencil"></use>
  </svg>
  Edit
`;

      editBtn.addEventListener("click", () => {
        editingAddressId = address._id;
        document.getElementById("addressFormTitle").textContent =
          "Edit Address";
        document.getElementById("addressLabel").value = address.label;
        document.getElementById("addressName").value = address.fullName;
        document.getElementById("addressPhone").value = address.phone;
        document.getElementById("addressText").value = address.address;
        document.getElementById("addressDefault").checked = address.isDefault;

        document.getElementById("addressFormMessage").textContent = "";
        document.getElementById("addressFormContainer").hidden = false;

        document.getElementById("addressFormContainer").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
//remove button
      
const removeButton = document.createElement("button");
removeButton.className = "link-btn muted";
removeButton.type = "button";
removeButton.textContent = "Remove";

removeButton.addEventListener("click", async () => {
  const confirmed = confirm(
    "Are you sure you want to remove this address?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:3000/api/user/addresses/${address._id}`,
      {
        method: "DELETE",
        credentials: "include"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to remove address.");
      return;
    }

    alert(data.message || "Address removed successfully!");

    await loadAddresses();

  } catch (error) {
    console.error("Remove Address Error:", error);
    alert("Unable to remove address. Please try again.");
  }
});

//default address 
if (!address.isDefault) {
  const defaultButton = document.createElement("button");
  defaultButton.className = "link-btn muted";
  defaultButton.type = "button";
  defaultButton.textContent = "Set as default";

  defaultButton.addEventListener("click", async () => {
    try {
      defaultButton.disabled = true;
      defaultButton.textContent = "Updating...";

      const response = await fetch(
        `http://127.0.0.1:3000/api/user/addresses/${address._id}/default`,
        {
          method: "PATCH",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update default address.");
        return;
      }

      await loadAddresses();

    } catch (error) {
      console.error("Set Default Address Error:", error);
      alert("Unable to update default address. Please try again.");
    } finally {
      defaultButton.disabled = false;
      defaultButton.textContent = "Set as default";
    }
  });

  footer.append(defaultButton);
}


      const actionGroup = document.createElement("span");
      actionGroup.className = "action-group";
      actionGroup.append(editBtn, removeButton);

      footer.append(actionGroup);

      card.append(header, addressElement, phone, footer);
      addressList.appendChild(card);
    });
  } catch (error) {
    console.error("Load Addresses Error:", error);
    addressList.textContent = "Unable to load addresses.";
  }
}

loadAddresses();

//delete address form

cancelAddressBtn.addEventListener("click", () => {
  addressFormContainer.hidden = true;
  addressForm.reset();
  addressFormMessage.textContent = "";
  editingAddressId = null;
});
