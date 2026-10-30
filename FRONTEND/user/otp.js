const otpInputs=document.querySelectorAll(".otp-input");
const otpForm=document.getElementById("otpForm");
const otpTimer = document.getElementById("otpTimer");
const resendOtp = document.getElementById("resendOtp");



//otp timer
let timeLeft = 60;

const timer = setInterval(() => {
  timeLeft--;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  otpTimer.textContent =
    `in ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (timeLeft <= 0) {
    clearInterval(timer);
    otpTimer.textContent = "You can resend now";
  }
}, 1000);




//resend otp
resendOtp.addEventListener("click",(event)=>{
    event.preventDefault();
    console.log("Resend OTP clicked!");
});


//otp numbers
otpInputs.forEach((input,index)=>{
    input.addEventListener("input",()=>{
        if(input.value.length===1 && index<otpInputs.length-1){
            otpInputs[index+1].focus();
        }
    });
});

verifyOTPForm.addEventListener("submit",async(event)=>{
    event.preventDefault();

    const otp=Array.from(otpInputs)
    .map(input=>input.value)
    .join("");

    const email=sessionStorage.getItem("verificationEmail");

    if(!email){
        formMessage.textContent="Email not found.Please login again";
        return;
    }

    if(otp.length !==6){
        formMessage.textContent="Please enter the 6-digit OTP.";
        formMessagr.className="form=message fail";
        return;
    }

    try{
        const response=await fetch("http://127.0.0.1:3000/api/user/verify-otp",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                credentials:"include",
                body:JSON.stringify({
                    email:email,
                    otp:otp
                })
            }
        );

        const data=await response.json();

        console.log("OTP Response",data);

        if(data.success){
            formMessage.textContent="Login Successful!";
            formMessage.className="form-message success";

            sessionStorage.removeItem("loginEmail");
            window.location.href="login.html";

        }else{
            formMessage.textContent=data.message;
            formMessage.className="form-message fail";
        }
    }catch(error){
        console.error("OTP Verification Error!",error);
        formMessage.textContent="Unable to connect to server";
        formMessage.className="form-message fail";
    }
});
