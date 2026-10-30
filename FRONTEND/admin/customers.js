let currentPage=1;
const limit=2;


async function getUsers(search = "") {
  try {
    const response = await fetch(`http://127.0.0.1:3000/api/admin/users?search=${encodeURIComponent(search)}&page=${currentPage}&limit=${limit}`, 
   {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();

    console.log("Users:", data);

    const pagination = data.pagination;
    renderPagination(pagination, search);

    console.log("Pagination:", pagination);

    if (!data.success) {
      console.error(data.message);
      return;
    }

    const userTableBody = document.getElementById("userTableBody");
    userTableBody.innerHTML = "";

    data.users.forEach((user) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.isBlocked ? "Blocked" : "Active"}</td>
        <td>1000</td>
        <td>Jan 12, 2026</td>
        <td>
          <button onclick="toggleBlockUser('${user._id}', ${user.isBlocked})">
            ${user.isBlocked ? "Unblock" : "Block"}
          </button>
        </td>
      `;

      userTableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error in Getting Users:", error);
  }
}



//pagination

function renderPagination(pagination, search = "") {
  const pageInfo = document.getElementById("pageInfo");
  const pager = document.getElementById("pager");

  pager.innerHTML = "";

  const { currentPage: page, totalPages, totalUsers, limit } = pagination;

  // Page information
  const start = totalUsers === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalUsers);

  pageInfo.textContent = `Showing ${start}–${end} of ${totalUsers}`;

  // Previous button
  const previousButton = document.createElement("button");
  previousButton.textContent = "‹";
  previousButton.disabled = page === 1;

  previousButton.addEventListener("click", function () {
    currentPage = page - 1;
    getUsers(search);
  });

  pager.appendChild(previousButton);

  // Page numbers
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    const pageButton = document.createElement("button");

    pageButton.textContent = pageNumber;

    if (pageNumber === page) {
      pageButton.classList.add("on");
    }

    pageButton.addEventListener("click", function () {
      currentPage = pageNumber;
      getUsers(search);
    });

    pager.appendChild(pageButton);
  }

  // Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "›";
  nextButton.disabled = page === totalPages;

  nextButton.addEventListener("click", function () {
    currentPage = page + 1;
    getUsers(search);
  });

  pager.appendChild(nextButton);
}


// BLOCK / UNBLOCK USER
async function toggleBlockUser(userId, isBlocked) {
  const action = isBlocked ? "unblock" : "block";

  const confirmed = confirm(
    `Are you sure you want to ${action} this user?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:3000/api/admin/users/${userId}/toggle-block`,
      {
        method: "PATCH",
        credentials: "include",
      }
    );

    const data = await response.json();

    console.log("Block/Unblock Response:", data);

    if (!data.success) {
      alert(data.message);
      return;
    }

    alert(data.message);

    getUsers();

  } catch (error) {
    console.error("Error in blocking/unblocking user:", error);
    alert("Something went wrong");
  }
}


// SEARCH USER
const searchInput = document.getElementById("search-customer");
console.log("Search input:", searchInput);

searchInput.addEventListener("keydown", function (event) {

  if (event.key === "Enter") {
    console.log("Search value:", searchInput.value);
    currentPage=1;
    getUsers(searchInput.value);
  }

});
searchInput.addEventListener("search", function () {
  if (searchInput.value === "") {
    currentPage=1;
    getUsers();
  }
});




getUsers();