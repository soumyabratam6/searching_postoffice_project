document.addEventListener("DOMContentLoaded", () => {
  let userIp = "";
  const ipApiUrl = "https://api.ipify.org?format=json";
  const ipApiDetailUrl = "https://ipapi.co";
  const getStartedBtn = document.getElementById("getStartedBtn");
  const additionalInfoDiv = document.getElementById("additionalInfo");
  const containerDiv = document.querySelector(".container");
  const ipAddressElem = document.getElementById("ipAddress");
  const ipAddressDetailElem = document.getElementById("ipAddressDetail");
  const locationInfoElem = document.getElementById("location-info");
  const moreInfoElem = document.getElementById("more-info");
  const currLocElem = document.getElementById("curr-loc");
  const postOfficeListElem = document.getElementById("post-office-list");
  const searchBox = document.getElementById("searchBox");

  fetch(ipApiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      userIp = data.ip;
      //console.log(userIp);
      ipAddressElem.textContent = userIp;
      ipAddressDetailElem.textContent = userIp;
      return fetch(`${ipApiDetailUrl}/${userIp}/json/`);
    })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      const {
        latitude,
        longitude,
        postal,
        city,
        region,
        org,
        network,
        timezone,
      } = data;
      let effectiveTimezone = timezone ? timezone : "UTC";

      locationInfoElem.innerHTML = `
        <div class="local">
        <div class="local-data">
          <div><strong>Lat:</strong> ${latitude}</div>
          <div><strong>City:</strong> ${city}</div>
          <div><strong>Organisation:</strong> ${org}</div>
        </div>
        <div class="local-data">
          <div><strong>Long:</strong> ${longitude}</div>  
          <div id="region"><strong>Region:</strong> ${region}</div>
          <div id="hostname"><strong>Hostname:</strong> ${network}</div>
        </div>
        </div>`;

      moreInfoElem.innerHTML = `
        <div class="more">
          <h2>More Information About You</h2>
          <p><strong>Time Zone:</strong> ${effectiveTimezone}</p>
          <p><strong>Date And Time:</strong> ${new Date().toLocaleString(
            "en-US",
            { timeZone: effectiveTimezone }
          )}</p>
          <p><strong>Pincode:</strong> ${postal}</p>
        </div>`;

      currLocElem.innerHTML = `
        <h2>Your Current Location</h2>
        <iframe src="https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed" frameborder="0" style="border:0"></iframe>`;

      return fetch(`https://api.postalpincode.in/pincode/${postal}`);
    })
    .then((response) => response.json())
    .then((data) => {
      const postOffices = data[0].PostOffice;
      if (Array.isArray(postOffices) && postOffices.length > 0) {
        const numberOfPostOffices = postOffices.length;
        moreInfoElem.innerHTML += `<div class="more"><p>Message: Number of post office(s) found: ${numberOfPostOffices}</p></div>`;
        displayPostOffices(postOffices);

        searchBox.addEventListener("input", (event) => {
          const searchTerm = event.target.value.toLowerCase();
          const filteredPostOffices = postOffices.filter(
            (postOffice) =>
              postOffice.Name.toLowerCase().includes(searchTerm) ||
              postOffice.BranchType.toLowerCase().includes(searchTerm)
          );
          displayPostOffices(filteredPostOffices);
        });
      } else {
        moreInfoElem.innerHTML += `<div class="more"><p>Message: No post offices found.</p></div>`;
        postOfficeListElem.innerHTML = "<p>No post offices found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching the information:", error);
      ipAddressElem.textContent = "Error fetching IP";
      ipAddressDetailElem.textContent = "Error fetching IP";
      locationInfoElem.textContent = "Error fetching location information";
      moreInfoElem.textContent = "Error fetching more information";
      postOfficeListElem.textContent = "Error fetching post offices";
    });

  getStartedBtn.addEventListener("click", () => {
    additionalInfoDiv.style.display = "block";
    containerDiv.style.display = "none";
    document.querySelector(".ip-address").style.display = "none";
  });

  function displayPostOffices(postOffices) {
    postOfficeListElem.innerHTML = "";
    postOffices.forEach((postOffice) => {
      const postOfficeElement = document.createElement("div");
      postOfficeElement.className = "post-office";
      postOfficeElement.innerHTML = `
        <p><strong>Name:</strong> ${postOffice.Name}</p>
        <p><strong>Branch Type:</strong> ${postOffice.BranchType}</p>
        <p><strong>Delivery Status:</strong> ${postOffice.DeliveryStatus}</p>
        <p><strong>District:</strong> ${postOffice.District}</p>
        <p><strong>Division:</strong> ${postOffice.Division}</p>`;
      postOfficeListElem.appendChild(postOfficeElement);
    });
  }
});
