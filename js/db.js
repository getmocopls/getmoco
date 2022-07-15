db.enablePersistence().catch((error) => {
  if (error.code == "failed-precondition") {
    console.log("multiple tabs opened");
  } else if (error.code == "unimplemented") {
    console.log("browser not support");
  }
});

// * Report User
function reportUser(reportedUser, reportedBy, page) {
  const reportModal = document.querySelector("#report_modal");
  const reportForm = reportModal.querySelector("#report_form");
  const reportButton = reportForm.querySelector(".report-button");
  const errorField = reportForm.querySelector(".error");

  reportForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const reportDetails = reportForm.report.value.trim();

    if (reportDetails !== "") {
      db.collection("getmoco_reports")
        .add({
          reportedUserType: reportedUser === "driver" ? "driver" : "user",
          reportedUser: reportedUser === "driver" ? driverID : customerID,
          reportedBy: reportedBy === "driver" ? driverID : customerID,
          details: reportDetails,
          orderID: orderID,
          locationID: locationID,
          page: page,
          created: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          errorField.innerHTML = `<blockquote class="green-text text-darken-3"><strong>Your report has been submitted.</strong></blockquote>`;
          reportButton.disabled = true;
          reportForm.report.disabled = true;
          reportForm.reset();
        });
    } else {
      errorField.innerHTML = `<blockquote class="red-text text-darken-3"><strong>Please enter your report details.</strong></blockquote>`;
    }
  });
}

/**
 ** ****************************************************************************
 **
 ** a_orders.html
 **
 ** ****************************************************************************
 */

// * Setup All Orders
function setupAllOrders() {
  const tableBody = document.querySelector(".table-body");
  const totalOrders = document.querySelector(".totalOrders");
  const totalDrivers = document.querySelector(".totalDrivers");
  const totalCustomers = document.querySelector(".totalCustomers");
  const expandButton = document.querySelector(
    "#expand_form input[name='expand']"
  );
  const orderTypeSelect = document.querySelector(".filter-orders-type select");

  tableBody.innerHTML = "";
  totalOrders.innerHTML = "0";
  totalDrivers.innerHTML = "0";
  totalCustomers.innerHTML = "0";

  expandButton.disabled = true;

  const selectVal =
    orderTypeSelect.options[orderTypeSelect.selectedIndex].value;

  let splitVal = selectVal.split(", ");

  // const dbQuery = db
  //   .collection("getmoco_orders")
  //   .where("status", "==", splitVal[0])
  //   .where(
  //     splitVal[1],
  //     splitVal[2],
  //     splitVal[3] === "false" || splitVal[3] === "true" ? eval(splitVal[3]) : ""
  //   )
  //   .orderBy(splitVal[4], "asc");

  const dbQuery =
    splitVal[0] === "pending"
      ? db
          .collection("getmoco_orders")
          .where("status", "in", ["current", "waiting"])
          .orderBy("created", "asc")
      : splitVal[0] === "ongoing"
      ? db
          .collection("getmoco_orders")
          .where("status", "in", ["transac", "toPay"])
          .orderBy("transac", "asc")
      : splitVal[0] === "delivered"
      ? db
          .collection("getmoco_orders")
          .where("status", "==", "paid")
          .orderBy("delivered", "asc")
      : "";

  dbQuery.get().then((snap) => {
    i = 0;
    j = 0;
    k = 0;
    m = 0;
    n = 0;

    orders = [];
    customers = [];
    drivers = [];

    if (!snap.empty) {
      snap.forEach((doc) => {
        orderCount = parseInt(totalOrders.textContent);
        customerCount = parseInt(totalDrivers.textContent);
        driverCount = parseInt(totalDrivers.textContent);

        // i++;
        // j++;
        // k++;
        // m++;
        // n++;

        renderAllOrders(doc.data(), doc.id, splitVal[4]);
      });
    }
  });
}

/**
 ** ****************************************************************************
 **
 ** a_sales_report.html
 **
 ** ****************************************************************************
 */

// * Search in Table
function searchInTable(searchName, tableName, start, max) {
  // Declare variables
  let input, filter, table, tr, td, txtValue;
  input = document.querySelector(searchName);
  filter = input.value.toUpperCase();
  table = document.querySelector(tableName);
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (let x = 0; x < tr.length; x++) {
    for (let y = start; y <= max; y++) {
      td = tr[x].getElementsByTagName("td")[y];
      if (td) {
        txtValue = td.textContent || td.innerText;
        //console.log(txtValue);
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[x].style.display = "";
          //console.log(tr[x]);
          break;
        } else if (y === max) {
          tr[x].style.display = "none";
        } else {
          continue;
        }
      }
    }
  }
}

// * Setup All Sales with Day, Week, Month
function setupAllSales() {
  //document.querySelector("#date-form").reset();
  const tableBody = document.querySelector(".table-body");
  const totalOrders = document.querySelector(".totalOrders");
  const totalDrivers = document.querySelector(".totalDrivers");
  const totalAppEarnings = document.querySelector(".totalAppEarnings");
  const totalDriverEarnings = document.querySelector(".totalDriverEarnings");
  const totalServiceFees = document.querySelector(".totalServiceFees");
  const totalItemFees = document.querySelector(".totalItemFees");
  const totalOrderFees = document.querySelector(".totalOrderFees");
  const downloadButton = document.querySelector(".download-button");
  const expandButton = document.querySelector(
    "#expand_form input[name='expand']"
  );

  tableBody.innerHTML = "";
  totalOrders.innerHTML = "0";
  totalDrivers.innerHTML = "0";
  totalAppEarnings.innerHTML = "0.00";
  totalDriverEarnings.innerHTML = "0.00";
  totalServiceFees.innerHTML = "0.00";
  totalItemFees.innerHTML = "0.00";
  totalOrderFees.innerHTML = "0.00";

  downloadButton.disabled = true;
  expandButton.disabled = true;

  db.collection("getmoco_orders")
    .orderBy("delivered", "asc")
    .get()
    .then((snap) => {
      i = 0;
      j = 0;

      drivers = [];

      if (!snap.empty) {
        snap.forEach((doc) => {
          orderCount = parseInt(totalOrders.textContent);
          driverCount = parseInt(totalDrivers.textContent);
          allAppEarnings = parseFloat(totalAppEarnings.textContent);
          allDriverEarnings = parseFloat(totalDriverEarnings.textContent);
          allServiceFees = parseFloat(totalServiceFees.textContent);
          allItemFees = parseFloat(totalItemFees.textContent);
          allOrderFees = parseFloat(totalOrderFees.textContent);

          i++;
          j++;

          renderAllSales(doc.data(), doc.id);
        });
      }
    });
}

// * View Driver Data
function setupViewDriverModal() {
  const tableContainer = document.querySelector(".table-body");
  const driverModal = document.querySelector("#driver_modal");

  tableContainer.addEventListener("click", (e) => {
    // console.log("e.target", e.target);

    const dataID = e.target.getAttribute("data-id");
    const targetAttr = e.target.parentElement.getAttribute("href");
    // console.log(targetAttr);

    currentDriverModalID = dataID;

    if (dataID !== null && targetAttr === "#driver_modal") {
      // console.log(dataID);

      const tr = document.querySelector(`.driver[data-id="${dataID}"]`);
      const modCount = tr.querySelector(".modCount");
      const modName = tr.querySelector(".modName");
      const modOrders = tr.querySelector(".modOrders");
      const modTotalFees = tr.querySelector(".modTotalFees");
      const modItemFees = tr.querySelector(".modItemFees");
      const modServiceFees = tr.querySelector(".modServiceFees");
      const modEarnings = tr.querySelector(".modEarnings");
      const modPlatformFee = tr.querySelector(".modPlatformFee");

      const dModName = driverModal.querySelector(".modName");
      const dModOrders = driverModal.querySelector(".modOrders");
      const dModTotalFees = driverModal.querySelector(".modTotalFees");
      const dModItemFees = driverModal.querySelector(".modItemFees");
      const dModServiceFees = driverModal.querySelector(".modServiceFees");
      const dModEarnings = driverModal.querySelector(".modEarnings");
      const dModPlatformFee = driverModal.querySelector(".modPlatformFee");

      dModName.innerHTML = modName.innerHTML;
      dModOrders.innerHTML = modOrders.innerHTML;
      dModTotalFees.innerHTML = modTotalFees.innerHTML;
      dModItemFees.innerHTML = modItemFees.innerHTML;
      dModServiceFees.innerHTML = modServiceFees.innerHTML;
      dModEarnings.innerHTML = modEarnings.innerHTML;
      dModPlatformFee.innerHTML = modPlatformFee.innerHTML;

      setupDriverSales();
    }
  });
}
// ? Setup Driver Sales();
function setupDriverSales() {
  const tableBody2 = document.querySelector(".table-body2");
  tableBody2.innerHTML = "";

  db.collection("getmoco_orders")
    .orderBy("delivered", "asc")
    .get()
    .then((snap) => {
      if (!snap.empty) {
        i = 0;

        drivers = [];

        snap.forEach((doc) => {
          i++;

          renderDriverSales(doc.data(), doc.id);
        });
      }
    });
}

// * View Orders
function setupViewOrderInfo() {
  const tableBody = document.querySelector(".table-body");
  const tableBody2 = document.querySelector(".table-body2");

  tableBody.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    document.querySelector(".order-items").innerHTML = "";

    const dataID = e.target.getAttribute("data-id");
    const targetAttr = e.target.parentElement.getAttribute("href");
    // console.log(targetAttr);

    if (dataID !== null && targetAttr === "#view_order_modal") {
      db.collection("getmoco_orders")
        .doc(dataID)
        .get()
        .then((doc) => {
          setupOrderDetails(dataID, "driver"); // called from d_order_details.html
          setOrderItems(doc.data().customerID, dataID); // called from d_order_details.html
        });
    }
  });

  if (tableBody2)
    tableBody2.addEventListener("click", (e) => {
      // console.log("e.target", e.target);
      // * bug = can't detect textContent

      document.querySelector(".order-items").innerHTML = "";

      const dataID = e.target.getAttribute("data-id");
      const targetAttr = e.target.parentElement.getAttribute("href");
      // console.log(targetAttr);

      if (dataID !== null && targetAttr === "#view_order_modal") {
        db.collection("getmoco_orders")
          .doc(dataID)
          .get()
          .then((doc) => {
            setupOrderDetails(dataID, "driver"); // called from d_order_details.html
            setOrderItems(doc.data().customerID, dataID); // called from d_order_details.html
          });
      }
    });
}

// * Export to PDF
function createPDF(tableName) {
  addTotalSalesAtTop("show"); // add total at top in print

  let sTable = document.querySelector(tableName).innerHTML;

  let style = "<style>";
  style = style + "table {width: 100%;font: 17px Calibri;}";
  style =
    style + "table, th, td {border: solid 1px #DDD; border-collapse: collapse;";
  style =
    style + "padding: 2px 3px;text-align: center;} h5 {text-align: center;}";
  style = style + "</style>";

  // CREATE A WINDOW OBJECT.
  let win = window.open("", "", "height=700,width=1000");

  win.document.write("<html><head>");
  // win.document.write("<title>Getmoco Data</title>"); // <title> FOR PDF HEADER.
  win.document.write(style); // ADD STYLE INSIDE THE HEAD TAG.
  win.document.write("</head>");
  win.document.write("<body><h5>Getmoco Data</h5>");
  win.document.write(sTable); // THE TABLE CONTENTS INSIDE THE BODY TAG.
  win.document.write("</body></html>");

  win.document.close(); // CLOSE THE CURRENT WINDOW.

  win.print(); // PRINT THE CONTENTS.

  addTotalSalesAtTop("delete");
}

// * Export Table Data to Excel
var exportTableToExcel = (function () {
  let uri = "data:application/vnd.ms-excel;base64,",
    template = `
      <html 
        xmlns:o="urn:schemas-microsoft-com:office:office" 
        xmlns:x="urn:schemas-microsoft-com:office:excel" 
        xmlns="http://www.w3.org/TR/REC-html40"
      >
        <meta charset="utf-8"/>
        <head>
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>{worksheet}</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
        </head>
        <body>
          <table>{table}</table>
        </body>
      </html>`;
  (base64 = function (s) {
    return window.btoa(unescape(encodeURIComponent(s)));
  }),
    (format = function (s, c) {
      return s.replace(/{(\w+)}/g, function (m, p) {
        return c[p];
      });
    });
  return function (table, name, filename) {
    addTotalSalesAtTop("show");

    if (!table.nodeType) table = document.querySelector(table);
    let ctx = { worksheet: name || "Worksheet", table: table.innerHTML };

    document.getElementById("excelLink").href =
      uri + base64(format(template, ctx));
    document.getElementById("excelLink").download = filename;
    document.getElementById("excelLink").click();

    addTotalSalesAtTop("delete");
  };
})();

// * Convert Table Data to CSV file
function tableToCSV(tableName) {
  addTotalSalesAtTop("show");

  // Variable to store the final csv data
  let csv_data = [];

  const table = document.querySelector(tableName);

  // Get each row data
  let rows = table.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    // Get each column data
    let cols = rows[i].querySelectorAll("td,th");

    // Stores each csv row data
    let csvrow = [];
    for (let j = 0; j < cols.length; j++) {
      // Get the text data of each cell
      // of a row and push it to csvrow

      let eachColumn;

      if (isNaN(cols[j].textContent.trim())) {
        const temp = cols[j].textContent.trim().replace(/[^\d.-]/g, "");
        const temp2 = new Date(cols[j].textContent.trim());
        // console.log(j, "temp", temp);
        // console.log(j, "temp2", temp2);

        if (!isNaN(parseFloat(temp)) && isNaN(temp2)) {
          eachColumn = "PHP " + temp;
        } else {
          eachColumn = cols[j].textContent.trim();
        }
      } else {
        eachColumn = cols[j].textContent.trim();
      }

      csvrow.push(eachColumn);
    }

    // Combine each column value with comma
    csv_data.push(csvrow.join(" | "));
  }

  // Combine each row data with new line character
  csv_data = csv_data.join("\n");

  // Call this function to download csv file
  downloadCSVFile(csv_data);

  addTotalSalesAtTop("delete");
}
// ? Export Converted Table Data to CSV
function downloadCSVFile(csv_data) {
  // Create CSV file object and feed
  // our csv_data into it
  CSVFile = new Blob([csv_data], {
    type: "text/csv",
  });

  // Create to temporary link to initiate
  // download process
  let temp_link = document.createElement("a");

  // Download csv file
  temp_link.download = "getmoco_data.csv";
  let url = window.URL.createObjectURL(CSVFile);
  temp_link.href = url;

  // This link should not be displayed
  temp_link.style.display = "none";
  document.body.appendChild(temp_link);

  // Automatically click the link to
  // trigger download
  temp_link.click();
  document.body.removeChild(temp_link);
}

/**
 ** ****************************************************************************
 **
 ** d_sales_report.html
 **
 ** ****************************************************************************
 */

// * View Orders
function setupViewOrder() {
  const orderContainer = document.querySelector(".list-result");
  orderContainer.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    document.querySelector(".order-items").innerHTML = "";

    const dataID = e.target.getAttribute("data-id");

    db.collection("getmoco_orders")
      .doc(dataID)
      .get()
      .then((doc) => {
        setupOrderDetails(dataID, "driver"); // called from d_order_details.html
        setOrderItems(doc.data().customerID, dataID); // called from d_order_details.html
      });
  });
}

// * Setup Order Sales with Day, Week, Month
function setupOrderSales() {
  //document.querySelector("#date-form").reset();
  document.querySelector(".list-result").innerHTML = "";
  document.querySelector(".totalEarnings").innerHTML = "0.00";
  document.querySelector(".totalFee").innerHTML = "0.00";
  document.querySelector(".totalOrders").innerHTML = "0";

  db.collection("getmoco_orders")
    .orderBy("delivered", "asc")
    .get()
    .then((snap) => {
      if (!snap.empty) {
        snap.forEach((doc) => {
          let earnings = parseFloat(
            document.querySelector(".totalEarnings").textContent
          );
          let fee = parseFloat(document.querySelector(".totalFee").textContent);
          let count = parseInt(
            document.querySelector(".totalOrders").textContent
          );

          renderOrderSales(doc.data(), doc.id, earnings, fee, count);
        });
      }
    });
}

/**
 ** ****************************************************************************
 **
 ** a_settings.html
 **
 ** ****************************************************************************
 */

// * Setup Matrix Info
function setupMatrixInfo(settingsID) {
  db.collection("getmoco_settings")
    .doc(settingsID)
    .onSnapshot(
      (doc) => {
        renderMatrixInfo(doc.data(), doc.id);
      },
      (err) => {
        console.log(err);
      }
    );
}

// * Update Account Details
function updateMatrixDetails(settingsID) {
  const editMatrixModal = document.querySelector("#edit-matrix-modal");
  const editMatrixForm = editMatrixModal.querySelector("#edit-matrix-form");
  const errorField = editMatrixForm.querySelector(".error");

  editMatrixForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const province = editMatrixForm.province.value.trim();
    const city = editMatrixForm.city.value.trim();
    const platformFee = editMatrixForm.platformFee.value.trim() / 100;
    const priceLimit = editMatrixForm.priceLimit.value.trim();
    const priceMatrix = editMatrixForm.priceMatrix.value.trim();

    db.collection("getmoco_settings")
      .doc(settingsID)
      .update({
        province: province,
        city: city,
        platformFee: platformFee.toString(),
        priceLimit: priceLimit.toString(),
        priceMatrix: priceMatrix.toString(),
      })
      .then(() => {
        errorField.innerHTML = `<blockquote class="green-text"><strong>Matrix settings updated successfully.</strong></blockquote>`;
      });
  });
}

/**
 ** ****************************************************************************
 **
 ** a_users.html
 **
 ** ****************************************************************************
 */

// ? Call searchInTable(searchName, tableName) from a_sales_report.html

// * Render User Info
function renderUserInfo() {
  const tableBody = document.querySelector(".table-body");

  // ? Tab Reports
  const tabListReports = document.querySelector("#tab-reports .list-reports");
  const warnModal = document.querySelector("#warn_modal");
  const disableModal = document.querySelector("#disable_modal");

  // ? Tab Verification
  const rejectIDmodal = document.querySelector("#reject_id_modal");
  const confirmIDmodal = document.querySelector("#confirm_id_modal");

  tableBody.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    if (e.target.className === "material-icons modal-trigger tooltipped view") {
      //console.log(e.target.parentElement);
      //console.log(e.target.parentElement.getAttribute("data-id"));

      const editAccountForm = document.querySelector("#edit-account-form");

      editAccountForm.querySelector(".helper-text.error").innerHTML = "";

      editAccountForm.reset();
      editAccountForm
        .querySelectorAll("label")
        .forEach((item) => (item.className = "active"));

      userID = "";
      userID = e.target.parentElement.getAttribute("data-id");

      if (
        (e.target.parentElement.getAttribute("data-id").className = "actions")
      ) {
        reportID = e.target.parentElement.getAttribute("data-report-id");
      }

      // ? Tab
      db.collection("getmoco_settings")
        .where("settings", "==", "ALL")
        .get()
        .then((snap) => {
          if (!snap.empty) {
            snap.forEach((doc) => {
              setProv = doc.data().province;
              setCity = doc.data().city;
              settingsLoc = setCity + ", " + setProv;

              const selectOptions = document.querySelector(
                `#edit-account-form div[data-id="${settingsLoc}"]`
              );

              if (selectOptions) {
                selectOptions.style.display = "block";
              }
            });
          }
        });
      db.collection("getmoco_users")
        .doc(userID)
        .onSnapshot(
          (doc) => {
            renderUserDetails(doc.data(), doc.id); // Tab Profile

            renderUserVerification(doc.data(), doc.id); // Tab Verification

            renderUserStatus(doc.data(), doc.id); // Tab Status
          },
          (err) => {
            console.log(err);
          }
        );

      // ? Tab Order
      db.collection("getmoco_users")
        .doc(userID)
        .get()
        .then((doc) => {
          tabOrderUserType = doc.data().type; // Tab Order

          // Total Spent
          const totalType = tabOrderUserType === "user" ? "Spent" : "Earnings";
          const totalTypeValue =
            tabOrderUserType === "user"
              ? parseFloat(doc.data().totalSpent).toFixed(2)
              : parseFloat(doc.data().totalEarnings).toFixed(2);

          document.querySelector("#tab-orders .totalType").innerHTML =
            totalType;
          document.querySelector("#tab-orders .totalTypeValue").innerHTML =
            totalTypeValue;
        });
      tabOrderSelect();

      // ? Tab Report
      tabReportSelect();
    }
  });

  // ? Tab Verification
  rejectIDmodal.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    if (
      e.target.className ===
      "waves-effect waves-light btn-small red reject-id-button"
    ) {
      db.collection("getmoco_uploads")
        .where("uploadedBy", "==", userID)
        .where("description", "==", "verify")
        .get()
        .then((snap) => {
          if (!snap.empty) {
            snap.forEach((doc) => {
              const verifyImgID = doc.id;

              db.collection("getmoco_uploads").doc(verifyImgID).update({
                status: "rejected",
              });
            });
          }
        });
      db.collection("getmoco_users").doc(userID).update({
        verified: "unverified",
        toVerify: "",
      });
      db.collection("getmoco_notifications")
        .add({
          title: "Getmoco: Invalid Verification ID",
          details:
            "Your uploaded ID is invalid. Please upload a new valid ID referring to the valid id types given.",
          type: "verify",
          status: "unread",
          seen: "",
          userID: userID,
          created: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          const instance = M.Modal.getInstance(rejectIDmodal);
          instance.close();
        });
    }
  });

  // ? Tab Verification
  confirmIDmodal.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    if (
      e.target.className ===
      "waves-effect waves-light btn-small confirm-id-button"
    ) {
      db.collection("getmoco_uploads")
        .where("uploadedBy", "==", userID)
        .where("description", "==", "verify")
        .get()
        .then((snap) => {
          if (!snap.empty) {
            snap.forEach((doc) => {
              const verifyImgID = doc.id;

              db.collection("getmoco_uploads").doc(verifyImgID).update({
                status: "approved",
                approved: firebase.firestore.FieldValue.serverTimestamp(),
              });
            });
          }
        });
      db.collection("getmoco_users").doc(userID).update({
        verified: "verified",
        verify: firebase.firestore.FieldValue.serverTimestamp(),
      });
      db.collection("getmoco_notifications")
        .add({
          title: "Getmoco: Verification ID Approved",
          details:
            "Your uploaded ID is valid. Your account is verified and you may now pin location and create transactions with Getmoco drivers.",
          type: "verify",
          status: "unread",
          seen: "",
          userID: userID,
          created: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          const instance = M.Modal.getInstance(confirmIDmodal);
          instance.close();
        });
    }
  });

  // ? Tab Report
  tabListReports.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    if (
      e.target.className ===
      "waves-effect waves-light btn teal punish-button modal-trigger"
    ) {
      //console.log(e.target.parentElement);
      //console.log(e.target.parentElement.getAttribute("data-id"));

      const punishUserModal = document.querySelector("#punish_user_modal");

      punishUserModal.querySelector(".error.helper-text").innerHTML = "";

      tabReportID = "";
      tabReportID = e.target.parentElement.getAttribute("data-id");

      let name;
      let userImage;
      let status;

      db.collection("getmoco_reports")
        .doc(tabReportID)
        .get()
        .then((doc) => {
          const reportedUser = doc.data().reportedUser;
          const reportedUserType = doc.data().reportedUserType;

          db.collection("getmoco_users")
            .doc(reportedUser)
            .get()
            .then((doc) => {
              name = `${doc.data().fname} ${doc.data().lname}`;
              status = doc.data().status;
            });
          db.collection("getmoco_uploads")
            .where("uploadedBy", "==", reportedUser)
            .where("description", "==", "profile")
            .get()
            .then((snap) => {
              if (!snap.empty) {
                snap.forEach((doc) => {
                  userImage = doc.data().url;
                });
              } else {
                userImage = "/img/default-user.jpg";
              }
            })
            .then(() => {
              const punishUserImage =
                punishUserModal.querySelector(".user-image");
              const punishName = punishUserModal.querySelector(".name");
              const punishUserTypeLabel =
                punishUserModal.querySelector(".user-type-label");
              const punishUserID = punishUserModal.querySelector(".user-id");
              const manageReport =
                punishUserModal.querySelector(".manage-report");
              const punishWarnButton =
                punishUserModal.querySelector(".warn-button");
              const punishDisableButton =
                punishUserModal.querySelector(".disable-button");

              punishUserImage.src = userImage;
              punishName.innerHTML = name;
              punishUserTypeLabel.innerHTML =
                reportedUserType === "user" ? "Customer ID:" : "Driver ID:";
              punishUserID.innerHTML = reportedUser;

              manageReport.setAttribute("data-id", doc.id);

              if (status === "disabled") {
                punishWarnButton.disabled = true;
                punishDisableButton.disabled = true;
              } else {
                punishWarnButton.disabled = false;
                punishDisableButton.disabled = false;
              }
            });
        });
    }
  });

  // ? Tab Report
  warnModal.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    const punishUserModal = document.querySelector("#punish_user_modal");

    if (
      e.target.className === "waves-effect waves-light btn orange warn-button"
    ) {
      //console.log(e.target.parentElement);
      //console.log(e.target.parentElement.getAttribute("data-id"));

      db.collection("getmoco_reports")
        .doc(tabReportID)
        .get()
        .then((doc) => {
          const reportedUser = doc.data().reportedUser;

          db.collection("getmoco_notifications")
            .add({
              title: "Getmoco: Warning!",
              details:
                "You have been reported by a user from your recent transaction, your account may become suspended for further reports.",
              type: "warning",
              status: "unread",
              seen: "",
              userID: reportedUser,
              created: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(() => {
              const instance = M.Modal.getInstance(warnModal);
              instance.close();

              punishUserModal.querySelector(
                ".error.helper-text"
              ).innerHTML = `<blockquote class="green-text"><strong>A warning message has been successfully sent to the reported user.</strong></blockquote>`;
            });
        });
    }
  });

  // ? Tab Report
  disableModal.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    const punishUserModal = document.querySelector("#punish_user_modal");

    const perUser = tableBody.querySelector(".user");
    const perUserStatus = perUser.querySelector(".status");
    const perUserStatusText = perUserStatus.querySelector("span");

    if (
      e.target.className === "waves-effect waves-light btn red disable-button"
    ) {
      //console.log(e.target.parentElement);
      //console.log(e.target.parentElement.getAttribute("data-id"));

      db.collection("getmoco_reports")
        .doc(tabReportID)
        .get()
        .then((doc) => {
          const reportedUser = doc.data().reportedUser;

          db.collection("getmoco_users").doc(reportedUser).update({
            status: "disabled",
            disabled: firebase.firestore.FieldValue.serverTimestamp(),
          });
          db.collection("getmoco_notifications")
            .where("userID", "==", reportedUser)
            .where("type", "==", "disable")
            .get()
            .then((snap) => {
              snap.forEach((doc) => {
                doc.ref.delete();
              });
            })
            .then(() => {
              db.collection("getmoco_notifications")
                .add({
                  title: "Getmoco: Account Disabled!",
                  details:
                    "You have been reported by a user from your recent transaction, your account has been disabled due to numerous reports to your account.",
                  type: "disable",
                  // status: "",
                  // seen: "",
                  userID: reportedUser,
                  created: firebase.firestore.FieldValue.serverTimestamp(),
                })
                .then(() => {
                  const instance = M.Modal.getInstance(disableModal);
                  instance.close();

                  punishUserModal.querySelector(
                    ".error.helper-text"
                  ).innerHTML = `<blockquote class="green-text"><strong>The user has been disabled. You may enable this user again in the status tab.</strong></blockquote>`;

                  punishUserModal.querySelector(
                    ".disable-button"
                  ).disabled = true;
                  punishUserModal.querySelector(".warn-button").disabled = true;

                  perUserStatusText.className = "red-text";
                  perUserStatusText.innerHTML = "Disabled";
                });
            });
        });
    }
  });
}

// * Change User Status
// ? Tab Status
function changeUserStatus() {
  const editStatusModal = document.querySelector("#edit_status_modal");
  const editStatusForm = editStatusModal.querySelector("form");

  editStatusForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const status = editStatusForm.querySelector(
      'input[name="status"]:checked'
    ).value;

    if (status === "active") {
      // Active

      db.collection("getmoco_notifications")
        .where("userID", "==", userID)
        .where("type", "==", "inactive")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.delete();
          });
        });
      db.collection("getmoco_notifications")
        .where("userID", "==", userID)
        .where("type", "==", "disable")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.delete();
          });
        });
    } else if (status === "inactive") {
      // Inactive

      db.collection("getmoco_notifications")
        .where("userID", "==", userID)
        .where("type", "==", "inactive")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.delete();
          });
        });
      db.collection("getmoco_notifications")
        .where("userID", "==", userID)
        .where("type", "==", "disable")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.delete();
          });
        })
        .then(() => {
          db.collection("getmoco_notifications").add({
            title: "Getmoco: Account Reactivated!",
            details:
              "You have been inactive recently, your account is now reactivated. Please proceed to continue using the Getmoco app.",
            type: "inactive",
            userID: userID,
            created: firebase.firestore.FieldValue.serverTimestamp(),
          });
        });
    } else if (status === "disabled") {
      // Disabled

      db.collection("getmoco_notifications")
        .where("userID", "==", userID)
        .where("type", "==", "inactive")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.delete();
          });
        });
      db.collection("getmoco_notifications")
        .where("userID", "==", userID)
        .where("type", "==", "disable")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.delete();
          });
        })
        .then(() => {
          db.collection("getmoco_notifications").add({
            title: "Getmoco: Account Disabled!",
            details:
              "Your account has been disabled due to recent violation in your transactions.",
            type: "disable",
            userID: userID,
            created: firebase.firestore.FieldValue.serverTimestamp(),
          });
        });
    }

    const dataStatus =
      status === "active"
        ? {
            status: status,
            inactive: "",
            disabled: "",
          }
        : status === "inactive"
        ? {
            status: status,
            inactive: firebase.firestore.FieldValue.serverTimestamp(),
            disabled: "",
          }
        : status === "disabled"
        ? {
            status: status,
            inactive: "",
            disabled: firebase.firestore.FieldValue.serverTimestamp(),
          }
        : "";

    db.collection("getmoco_users")
      .doc(userID)
      .update(dataStatus)
      .then(() => {
        const instance = M.Modal.getInstance(editStatusModal);
        instance.close();
      });
  });
}

// * Tab Report Select
// ? Tab Report
function tabReportSelect() {
  const tabReportList = document.querySelector("#tab-reports .list-reports");

  const tabReportSelect = document.querySelector("#tab-reports select");
  const selectVal =
    tabReportSelect.options[tabReportSelect.selectedIndex].value;

  let tabReportCount = 0;

  tabReportList.innerHTML = "";

  db.collection("getmoco_reports")
    .where(selectVal, "==", userID)
    .orderBy("created", "desc")
    .get()
    .then((snap) => {
      if (!snap.empty) {
        snap.forEach((doc) => {
          tabReportCount++;
          renderUserReportsList(doc.data(), doc.id, tabReportCount, selectVal);
        });
      } else {
        tabReportList.innerHTML =
          '<h6 class="center-align">No Reports Found.</h6>';
      }
    });
}

// * Tab Order Select
// ? Tab Order
function tabOrderSelect() {
  const tabOrderSelect = document.querySelector("#tab-orders select");
  const selectVal = tabOrderSelect.options[tabOrderSelect.selectedIndex].value;

  // console.log(selectVal);

  const userType = tabOrderUserType === "user" ? "customerID" : "driverID";

  let splitVal = selectVal.split(", ");

  const dbQuery =
    splitVal[0] === "toShip"
      ? db
          .collection("getmoco_orders")
          .where(userType, "==", userID)
          .where("shipStatus", "==", splitVal[0])
          .orderBy(splitVal[1], splitVal[2])
      : db
          .collection("getmoco_orders")
          .where(userType, "==", userID)
          .where("shipStatus", "==", splitVal[0])
          .where(splitVal[1], splitVal[2], eval(splitVal[3]))
          .orderBy(splitVal[4], splitVal[5]);

  dbQuery.get().then((snapshot) => {
    const tabOrderList = document.querySelector("#tab-orders .list-orders");

    tabOrderList.innerHTML = "";

    let tabOrderCount = 0;

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        tabOrderCount++;
        renderUserOrdersList(
          doc.data(),
          doc.id,
          splitVal[0],
          eval(splitVal[3]),
          tabOrderCount,
          userType
        );
      });
    } else {
      tabOrderList.innerHTML = '<h6 class="center-align">No Orders Found.</h6>';
    }
  });
}

// * Update User Details
// ? Tab Profile
function updateUserDetails() {
  const editAccountModal = document.querySelector("#edit-account-modal");
  const editAccountForm = editAccountModal.querySelector("#edit-account-form");
  const errorField = editAccountForm.querySelector(".error");

  editAccountForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // const fileHolder = editAccountForm.querySelector("#file-holder");
    // const fileHolderText = editAccountForm.querySelector(".file-path.validate");

    let tempf = editAccountForm.firstName.value.trim();
    const fname = tempf.charAt(0).toUpperCase() + tempf.slice(1).toLowerCase();
    let templ = editAccountForm.lastName.value.trim();
    const lname = templ.charAt(0).toUpperCase() + templ.slice(1).toLowerCase();
    const contact = editAccountForm.contact.value.trim();

    const province = setProv;
    const city = setCity;
    const town = editAccountForm
      .querySelector(`div[data-id="${settingsLoc}"] select`)
      .value.trim();
    let splitVal = town.split(" | ");
    const dmDestination = splitVal[0];
    const brgy = splitVal[1];
    const zip = splitVal[2];

    const street = editAccountForm.street.value.trim();
    const house = editAccountForm.house.value.trim();
    const landmark = editAccountForm.landmark.value.trim();
    const address =
      house + " " + street + ", " + brgy + ", " + settingsLoc + " " + zip;

    const curr_email = editAccountForm.curr_email.value.trim();
    const curr_password = editAccountForm.curr_password.value.trim();
    const new_email = editAccountForm.new_email.value.trim();
    const new_password = editAccountForm.new_password.value.trim();
    const new_confirm_password =
      editAccountForm.new_confirm_password.value.trim();

    let proceedContact = false;
    let tempContact = "";

    db.collection("getmoco_users")
      .doc(userID)
      .update({
        fname: fname,
        lname: lname,
        dmDestination: dmDestination,
        address: address,
        zip: zip,
        province: province,
        city: city,
        brgy: brgy,
        street: street,
        house: house,
        landmark: landmark,
        modified: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        const fileHolder = editAccountForm.querySelector("#file-holder");

        if (fileHolder.files.length !== 0) {
          errorField.innerHTML = `<blockquote class="green-text"><strong>Updating... please wait.</strong></blockquote>`;
        } else {
          errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
        }
      })
      .then(() => {
        const fileHolder = editAccountForm.querySelector("#file-holder");
        const fileHolderText = editAccountForm.querySelector(
          ".file-path.validate"
        );

        if (fileHolder.files.length !== 0) {
          const file = fileHolder.files[0];
          const name = "G-" + new Date().getTime();

          const metadata = {
            contentType: file.type,
          };

          storageRef
            .child(name)
            .put(file, metadata)
            // uploadTask
            .then((snapshot) => snapshot.ref.getDownloadURL())
            .then((url) => {
              // console.log(url);

              //uploadDisplay.src = url;
              fileHolder.value = "";
              fileHolderText.value = "";

              //uploadNote.innerHTML = "Note: Waiting for client receipt confirmation.";

              db.collection("getmoco_uploads")
                .where("uploadedBy", "==", userID)
                .where("description", "==", "profile")
                .get()
                .then((snapshot) => {
                  if (!snapshot.empty) {
                    snapshot.forEach((doc) => {
                      const docID = doc.id;
                      const docFilename = doc.data().filename;

                      // Delete Existing Picture
                      storageRef.child(docFilename).delete();

                      db.collection("getmoco_uploads")
                        .doc(docID)
                        .update({
                          filename: name,
                          url: url,
                          modified:
                            firebase.firestore.FieldValue.serverTimestamp(),
                        })
                        .then(() => {
                          errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                        })
                        .catch((err) => {
                          console.log(err);
                        });
                    });
                  } else {
                    db.collection("getmoco_uploads")
                      .add({
                        uploadedBy: userID,
                        filename: name,
                        url: url,
                        description: "profile",
                        created:
                          firebase.firestore.FieldValue.serverTimestamp(),
                      })
                      .then(() => {
                        errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }

                  const profPic = document.querySelectorAll(".user-image");
                  profPic.forEach((item) => (item.src = url));
                });
            });
        }

        if (contact !== "") {
          db.collection("getmoco_users")
            .where("type", "in", ["user", "driver"])
            .get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                // console.log(doc.id, " => ", doc.data());

                if (doc.data().contact === contact)
                  return (tempContact = contact);
              });
            })
            .then(() => {
              // Contact
              if (tempContact !== contact) {
                proceedContact = true;
                //errorField.innerHTML = "";
              } else {
                proceedContact = false;
                errorField.innerHTML = `<blockquote><strong class="red-text">The mobile number is already registered.</strong></blockquote>`;
              }

              // Clear error field
              if (tempContact !== contact) {
                errorField.innerHTML = "";
              }

              //console.log(doc.data(), tempContact, contact, password, cPassword);
              //console.log(proceedContact, proceedPass);
            })
            .then(() => {
              // Update Contact
              if (proceedContact) {
                db.collection("getmoco_users")
                  .doc(userID)
                  .update({
                    contact: contact,
                  })
                  .then(() => {
                    errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            });
        }

        if (new_email !== "") {
          if (curr_email !== "" && curr_password !== "") {
            db.collection("getmoco_users").doc(userID).update({
              email: new_email,
            });

            firebase
              .auth()
              .signInWithEmailAndPassword(curr_email, curr_password)
              .then((userCredential) => {
                userCredential.user
                  .updateEmail(new_email)
                  .then(() => {
                    const email = document.querySelectorAll(".email");
                    email.forEach((item) => (item.innerHTML = new_email));

                    errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              })
              .catch((err) => {
                errorField.innerHTML = `<blockquote><strong class="red-text">${err.message}</strong></blockquote>`;
              });
          } else {
            errorField.innerHTML = `<blockquote><strong class="red-text">Please enter current email and password.</strong></blockquote>`;
          }
        }

        if (new_password !== "" && new_confirm_password !== "") {
          if (curr_email !== "" && curr_password !== "") {
            if (new_password === new_confirm_password) {
              db.collection("getmoco_users").doc(userID).update({
                password: new_password,
              });

              firebase
                .auth()
                .signInWithEmailAndPassword(curr_email, curr_password)
                .then((userCredential) => {
                  userCredential.user
                    .updatePassword(new_password)
                    .then(() => {
                      errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                })
                .catch((err) => {
                  errorField.innerHTML = `<blockquote><strong class="red-text">${err.message}</strong></blockquote>`;
                });
            } else {
              errorField.innerHTML = `<blockquote><strong class="red-text">Password do not match.</strong></blockquote>`;
            }
          } else {
            errorField.innerHTML = `<blockquote><strong class="red-text">Please enter current email and password.</strong></blockquote>`;
          }
        } else if (
          (new_password === "" && new_confirm_password !== "") ||
          (new_confirm_password === "" && new_password !== "")
        ) {
          errorField.innerHTML = `<blockquote class="red-text"><strong>Password do not match.</strong></blockquote>`;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

// * Search User
// ref.collection('user').orderBy('name').startAt(name).endAt(name+'\uf8ff')
function searchUser(val) {
  const refresh = document.querySelector(".refresh-button");
  const tableMain = document.querySelector(".table-main");
  const tableHead = tableMain.querySelector(".table-head");
  const tableBody = tableMain.querySelector(".table-body");
  const noResult = document.querySelector(".no-result");

  refresh.disabled = true;
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
  noResult.innerHTML = "";

  const select = document.querySelector(".filter-users select");
  const selectVal = select.options[select.selectedIndex].value;

  let splitVal = selectVal.split(", ");
  //splitVal[0];
  //console.log(splitVal);

  const dbQuery =
    splitVal[0] === "all"
      ? db
          .collection("getmoco_users")
          .where(splitVal[1], splitVal[2], splitVal[3])
          .orderBy(splitVal[4], splitVal[5])
          .startAt(val)
          .endAt(val + "\uf8ff")
      : splitVal[0] === "verified"
      ? db
          .collection("getmoco_users")
          .where(splitVal[0], splitVal[1], splitVal[2])
          .where(splitVal[3], splitVal[4], splitVal[5])
          .orderBy(splitVal[6], splitVal[7])
          .startAt(val)
          .endAt(val + "\uf8ff")
      : splitVal[0] === "reportedUserType"
      ? db
          .collection("getmoco_reports")
          .where(splitVal[0], splitVal[1], splitVal[2])
          .orderBy(splitVal[3], splitVal[4])
      : // .startAt(val)
        //.endAt(val + "\uf8ff")
        "";

  dbQuery
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        let count = 0;

        setUsersTableHead(splitVal[0]);

        snapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, " => ", doc.data());

          count++;
          renderUsersList(doc.data(), doc.id, splitVal[0], count);
        });
      } else {
        noResult.innerHTML = `
          <h5 class="center-align">
          No Getmoco 
          ${splitVal[0] === "reportedUserType" ? "Reports" : "Users"} 
          Found.
          </h5>
        `;
        tableHead.innerHTML = "";
        tableBody.innerHTML = "";
      }
    })
    .then(() => {
      refresh.disabled = false;
    })
    .catch((error) => {
      console.log(error.message);
    });
}

// * Setup Users List
function setupUsersList() {
  const refresh = document.querySelector(".refresh-button");
  const tableMain = document.querySelector(".table-main");
  const tableHead = tableMain.querySelector(".table-head");
  const tableBody = tableMain.querySelector(".table-body");
  const noResult = document.querySelector(".no-result");
  const search = document.querySelector("#search");

  refresh.disabled = true;
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
  noResult.innerHTML = "";
  search.value = "";
  document.querySelector(".search label").className = "";

  const select = document.querySelector(".filter-users select");
  const selectVal = select.options[select.selectedIndex].value;

  let splitVal = selectVal.split(", ");
  //splitVal[0];
  //console.log(splitVal);

  if (splitVal[0] === "reportedUserType") {
    document.querySelector(".search").style.display = "none";
  } else {
    document.querySelector(".search").style.display = "block";
  }

  const dbQuery =
    splitVal[0] === "all"
      ? db
          .collection("getmoco_users")
          .where(splitVal[1], splitVal[2], splitVal[3])
          .orderBy(splitVal[4], splitVal[5])
      : splitVal[0] === "verified"
      ? db
          .collection("getmoco_users")
          .where(splitVal[0], splitVal[1], splitVal[2])
          .where(splitVal[3], splitVal[4], splitVal[5])
          .orderBy(splitVal[6], splitVal[7])
      : splitVal[0] === "reportedUserType"
      ? db
          .collection("getmoco_reports")
          .where(splitVal[0], splitVal[1], splitVal[2])
          .orderBy(splitVal[3], splitVal[4])
      : "";

  dbQuery
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        let count = 0;

        setUsersTableHead(splitVal[0]);

        snapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, " => ", doc.data());

          count++;
          renderUsersList(doc.data(), doc.id, splitVal[0], count);
        });
      } else {
        if (splitVal[0] !== "reportedUserType") {
          noResult.innerHTML =
            '<h5 class="center-align">No Getmoco Users Found.</h5>';
        } else {
          noResult.innerHTML =
            '<h5 class="center-align">No Reports Found.</h5>';
        }
        tableHead.innerHTML = "";
        tableBody.innerHTML = "";
      }
    })
    .then(() => {
      refresh.disabled = false;
    })
    .catch((error) => {
      console.log(error.message);
    });
}

/**
 ** ****************************************************************************
 **
 ** profile.html / d_profile.html / a_profile.html
 **
 ** ****************************************************************************
 */

// * Setup Profile Info
function setupProfileInfo(userID, user) {
  db.collection("getmoco_settings")
    .where("settings", "==", "ALL")
    .get()
    .then((snap) => {
      if (!snap.empty) {
        snap.forEach((doc) => {
          setProv = doc.data().province;
          setCity = doc.data().city;
          settingsLoc = setCity + ", " + setProv;

          const selectOptions = document.querySelector(
            `#edit-account-form div[data-id="${settingsLoc}"]`
          );

          if (selectOptions) {
            selectOptions.style.display = "block";
          }
        });
      }
    });
  db.collection("getmoco_users")
    .doc(userID)
    .onSnapshot(
      (doc) => {
        renderProfileInfo(userID, doc.data(), doc.id, user);
        setupMenuUI(user);
      },
      (err) => {
        console.log(err);
      }
    );
}

// * Update Account Details
function uploadValidID(userID) {
  const verifyAccountModal = document.querySelector("#verify-account-modal");
  const verifiedContainer = verifyAccountModal.querySelector(".verified");
  const toVerifyContainer = verifyAccountModal.querySelector(".toVerify");
  const unverifiedContainer = verifyAccountModal.querySelector(".unverified");
  const verifyAccountForm = unverifiedContainer.querySelector(
    "#verify-account-form"
  );
  const uploadButton = verifyAccountForm.querySelector(".upload-button");
  const errorField = verifyAccountForm.querySelector(".error");

  verifyAccountForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fileHolder = verifyAccountForm.querySelector("#verify-file-holder");
    const fileHolderText = verifyAccountForm.querySelector(
      ".verify.file-path.validate"
    );

    if (fileHolder.files.length !== 0) {
      errorField.innerHTML = `<blockquote class="green-text"><h6>Uploading... please wait.</h6></blockquote>`;
    } else {
      errorField.innerHTML = `<blockquote class="red-text"><h6>No image file is selected.</h6></blockquote>`;
    }

    const file = fileHolder.files[0];
    const name = "G-" + new Date().getTime();

    const metadata = {
      contentType: file.type,
    };

    storageRef
      .child(name)
      .put(file, metadata)
      // uploadTask
      .then((snapshot) => snapshot.ref.getDownloadURL())
      .then((url) => {
        // console.log(url);

        //uploadDisplay.src = url;
        fileHolder.value = "";
        fileHolderText.value = "";

        //uploadNote.innerHTML = "Note: Waiting for client receipt confirmation.";

        db.collection("getmoco_uploads")
          .where("uploadedBy", "==", userID)
          .where("description", "==", "verify")
          .get()
          .then((snapshot) => {
            if (!snapshot.empty) {
              snapshot.forEach((doc) => {
                const docID = doc.id;
                const docFilename = doc.data().filename;

                // Delete Existing Picture
                storageRef.child(docFilename).delete();

                db.collection("getmoco_uploads")
                  .doc(docID)
                  .update({
                    filename: name,
                    url: url,
                    status: "",
                    modified: firebase.firestore.FieldValue.serverTimestamp(),
                  })
                  .then(() => {
                    verifiedContainer.style.display = "none";
                    toVerifyContainer.style.display = "block";
                    unverifiedContainer.style.display = "none";
                    uploadButton.disabled = true;
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              });
            } else {
              db.collection("getmoco_uploads")
                .add({
                  uploadedBy: userID,
                  filename: name,
                  url: url,
                  description: "verify",
                  status: "",
                  created: firebase.firestore.FieldValue.serverTimestamp(),
                })
                .then(() => {
                  verifiedContainer.style.display = "none";
                  toVerifyContainer.style.display = "block";
                  unverifiedContainer.style.display = "none";
                  uploadButton.disabled = true;
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          })
          .then(() => {
            db.collection("getmoco_users")
              .doc(userID)
              .update({
                verified: "toVerify",
                toVerify: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .catch((err) => {
                console.log(err);
              });
          });
      });
  });
}

// * Update Account Details
function updateAccountDetails(userID, user) {
  const editAccountModal = document.querySelector("#edit-account-modal");
  const editAccountForm = editAccountModal.querySelector("#edit-account-form");
  const errorField = editAccountForm.querySelector(".error");

  editAccountForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fileHolder = editAccountForm.querySelector("#file-holder");
    const fileHolderText = editAccountForm.querySelector(".file-path.validate");

    let tempf = editAccountForm.firstName.value.trim();
    const fname = tempf.charAt(0).toUpperCase() + tempf.slice(1).toLowerCase();
    let templ = editAccountForm.lastName.value.trim();
    const lname = templ.charAt(0).toUpperCase() + templ.slice(1).toLowerCase();
    const contact = editAccountForm.contact.value.trim();

    const province = setProv;
    const city = setCity;
    const town = editAccountForm
      .querySelector(`div[data-id="${settingsLoc}"] select`)
      .value.trim();
    let splitVal = town.split(" | ");
    const dmDestination = splitVal[0];
    const brgy = splitVal[1];
    const zip = splitVal[2];

    const street = editAccountForm.street.value.trim();
    const house = editAccountForm.house.value.trim();
    const landmark = editAccountForm.landmark.value.trim();
    const address =
      house + " " + street + ", " + brgy + ", " + settingsLoc + " " + zip;

    const curr_email = editAccountForm.curr_email.value.trim();
    const curr_password = editAccountForm.curr_password.value.trim();
    const new_email = editAccountForm.new_email.value.trim();
    const new_password = editAccountForm.new_password.value.trim();
    const new_confirm_password =
      editAccountForm.new_confirm_password.value.trim();

    let proceedContact = false;
    let tempContact = "";

    db.collection("getmoco_users")
      .doc(userID)
      .update({
        fname: fname,
        lname: lname,
        dmDestination: dmDestination,
        address: address,
        zip: zip,
        province: province,
        city: city,
        brgy: brgy,
        street: street,
        house: house,
        landmark: landmark,
        modified: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        if (fileHolder.files.length !== 0) {
          errorField.innerHTML = `<blockquote class="green-text"><strong>Updating... please wait.</strong></blockquote>`;
        } else {
          errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
        }
      })
      .then(() => {
        if (fileHolder.files.length !== 0) {
          const file = fileHolder.files[0];
          const name = "G-" + new Date().getTime();

          const metadata = {
            contentType: file.type,
          };

          storageRef
            .child(name)
            .put(file, metadata)
            // uploadTask
            .then((snapshot) => snapshot.ref.getDownloadURL())
            .then((url) => {
              // console.log(url);

              //uploadDisplay.src = url;
              fileHolder.value = "";
              fileHolderText.value = "";

              //uploadNote.innerHTML = "Note: Waiting for client receipt confirmation.";

              db.collection("getmoco_uploads")
                .where("uploadedBy", "==", userID)
                .where("description", "==", "profile")
                .get()
                .then((snapshot) => {
                  if (!snapshot.empty) {
                    snapshot.forEach((doc) => {
                      const docID = doc.id;
                      const docFilename = doc.data().filename;

                      // Delete Existing Picture
                      storageRef.child(docFilename).delete();

                      db.collection("getmoco_uploads")
                        .doc(docID)
                        .update({
                          filename: name,
                          url: url,
                          modified:
                            firebase.firestore.FieldValue.serverTimestamp(),
                        })
                        .then(() => {
                          errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                        })
                        .catch((err) => {
                          console.log(err);
                        });
                    });
                  } else {
                    db.collection("getmoco_uploads")
                      .add({
                        uploadedBy: userID,
                        filename: name,
                        url: url,
                        description: "profile",
                        created:
                          firebase.firestore.FieldValue.serverTimestamp(),
                      })
                      .then(() => {
                        errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }

                  const profPic = document.querySelectorAll(".user-image");
                  profPic.forEach((item) => (item.src = url));
                });
            });
        }

        if (contact !== "") {
          db.collection("getmoco_users")
            .where("type", "in", ["user", "driver"])
            .get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                // console.log(doc.id, " => ", doc.data());

                if (doc.data().contact === contact)
                  return (tempContact = contact);
              });
            })
            .then(() => {
              // Contact
              if (tempContact !== contact) {
                proceedContact = true;
                //errorField.innerHTML = "";
              } else {
                proceedContact = false;
                errorField.innerHTML = `<blockquote><strong class="red-text">The mobile number is already registered.</strong></blockquote>`;
              }

              // Clear error field
              if (tempContact !== contact) {
                errorField.innerHTML = "";
              }

              //console.log(doc.data(), tempContact, contact, password, cPassword);
              //console.log(proceedContact, proceedPass);
            })
            .then(() => {
              // Update Contact
              if (proceedContact) {
                db.collection("getmoco_users")
                  .doc(userID)
                  .update({
                    contact: contact,
                  })
                  .then(() => {
                    errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            });
        }

        if (new_email !== "") {
          if (curr_email !== "" && curr_password !== "") {
            db.collection("getmoco_users").doc(userID).update({
              email: new_email,
            });

            firebase
              .auth()
              .signInWithEmailAndPassword(curr_email, curr_password)
              .then((userCredential) => {
                userCredential.user
                  .updateEmail(new_email)
                  .then(() => {
                    const email = document.querySelectorAll(".email");
                    email.forEach((item) => (item.innerHTML = new_email));

                    errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              })
              .catch((err) => {
                errorField.innerHTML = `<blockquote><strong class="red-text">${err.message}</strong></blockquote>`;
              });
          } else {
            errorField.innerHTML = `<blockquote><strong class="red-text">Please enter current email and password.</strong></blockquote>`;
          }
        }

        if (new_password !== "" && new_confirm_password !== "") {
          if (curr_email !== "" && curr_password !== "") {
            if (new_password === new_confirm_password) {
              db.collection("getmoco_users").doc(userID).update({
                password: new_password,
              });

              firebase
                .auth()
                .signInWithEmailAndPassword(curr_email, curr_password)
                .then((userCredential) => {
                  userCredential.user
                    .updatePassword(new_password)
                    .then(() => {
                      errorField.innerHTML = `<blockquote class="green-text"><strong>Account updated successfully.</strong></blockquote>`;
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                })
                .catch((err) => {
                  errorField.innerHTML = `<blockquote><strong class="red-text">${err.message}</strong></blockquote>`;
                });
            } else {
              errorField.innerHTML = `<blockquote><strong class="red-text">Password do not match.</strong></blockquote>`;
            }
          } else {
            errorField.innerHTML = `<blockquote><strong class="red-text">Please enter current email and password.</strong></blockquote>`;
          }
        } else if (
          (new_password === "" && new_confirm_password !== "") ||
          (new_confirm_password === "" && new_password !== "")
        ) {
          errorField.innerHTML = `<blockquote class="red-text"><strong>Password do not match.</strong></blockquote>`;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

/**
 ** ****************************************************************************
 **
 ** order_details.html / d_order_details.html
 **
 ** ****************************************************************************
 */

// * Setup Order Details
function setupOrderDetails(orderID, type) {
  db.collection("getmoco_orders")
    .doc(orderID)
    .onSnapshot(
      {
        // Listen for document metadata changes
        includeMetadataChanges: true,
      },
      (doc) => {
        modifyOrderDetails(doc.data(), doc.id, type);
      },
      (err) => {
        console.log(err);
      }
    );
}

// * Set as Received
function setAsReceived(boolean, orderID, locationID) {
  db.collection("getmoco_orders")
    .doc(orderID)
    .update({
      orderReceived: boolean,
      received: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .catch((err) => {
      console.log(err.message);
    });
  db.collection("getmoco_locations")
    .doc(locationID)
    .update({
      orderReceived: boolean,
      received: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .catch((err) => {
      console.log(err.message);
    });
}

// * Back to orders list
function backToOrdersList(ordLocID, type) {
  if (type === "customer") {
    db.collection("getmoco_orders")
      .doc(ordLocID)
      .update({
        request: "",
      })
      .then(() => {
        window.location.href = "/pages/orders.html";
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    db.collection("getmoco_locations")
      .doc(ordLocID)
      .update({
        request: "",
      })
      .then(() => {
        window.location.href = "/pages/d_orders.html";
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

/**
 ** ****************************************************************************
 **
 ** driver_delivery.html
 **
 ** ****************************************************************************
 */

// * Setup Delivery Status
function setupDeliveryStatus(locationID) {
  db.collection("getmoco_locations").onSnapshot(
    (snapshot) => {
      // console.log(snapshot);

      if (!snapshot.empty) {
        snapshot.docChanges().forEach((change) => {
          //console.log(change, change.doc.data(), change.doc.id);

          const docID = change.doc.id;

          if (docID === locationID) {
            if (change.type === "added" || change.type === "modified") {
              modifyDeliveryStatus(change.doc.data(), change.doc.id);
            }
          }
        });
      }
    },
    (error) => {
      console.log(error);
    }
  );
}

// * Set as Delivered
function setAsDelivered(status, locationID, orderID) {
  let platformFee = 1; // 100%
  let appTotalEarnings = 0;
  let serviceFee = 0;
  let totalItemsPrice = 0;
  let driverTotalEarnings = 0;
  let customerTotalSpent = 0;
  let settingsID;

  db.collection("getmoco_settings")
    .where("settings", "==", "ALL")
    .get()
    .then((snap) => {
      if (!snap.empty) {
        snap.forEach((doc) => {
          platformFee = parseFloat(doc.data().platformFee);
          appTotalEarnings = parseFloat(doc.data().totalEarnings);

          settingsID = doc.id;
        });
      }
    });
  db.collection("getmoco_orders")
    .doc(orderID)
    .get()
    .then((doc) => {
      serviceFee = parseFloat(doc.data().serviceFee);
      totalItemsPrice = parseFloat(doc.data().totalItemsPrice);
    });
  db.collection("getmoco_users")
    .doc(driverID)
    .get()
    .then((doc) => {
      driverTotalEarnings = parseFloat(doc.data().totalEarnings);
    });
  db.collection("getmoco_users")
    .doc(customerID)
    .get()
    .then((doc) => {
      customerTotalSpent = parseFloat(doc.data().totalSpent);
    })
    .then(() => {
      const driverPercent = 1 - platformFee;

      const driverEarning = serviceFee * driverPercent;
      driverTotalEarnings += driverEarning;

      const appEarning = serviceFee * platformFee;
      appTotalEarnings += appEarning;

      const customerSpent = totalItemsPrice;
      customerTotalSpent += customerSpent;

      db.collection("getmoco_settings")
        .doc(settingsID)
        .update({
          totalEarnings: appTotalEarnings.toFixed(2).toString(),
        });
      db.collection("getmoco_users")
        .doc(driverID)
        .update({
          totalEarnings: driverTotalEarnings.toFixed(2).toString(),
        });
      db.collection("getmoco_users")
        .doc(customerID)
        .update({
          totalSpent: customerTotalSpent.toFixed(2).toString(),
        });

      db.collection("getmoco_locations")
        .doc(locationID)
        .update({
          driverEarning: driverEarning.toFixed(2).toString(),
          appEarning: appEarning.toFixed(2).toString(),
          status: status,
          delivered: firebase.firestore.FieldValue.serverTimestamp(),
        });
      db.collection("getmoco_orders")
        .doc(orderID)
        .update({
          driverEarning: driverEarning.toFixed(2).toString(),
          appEarning: appEarning.toFixed(2).toString(),
          status: "paid",
          shipStatus: "completed",
          delivered: firebase.firestore.FieldValue.serverTimestamp(),
        });
    });
}

/**
 ** ****************************************************************************
 **
 ** orders.html / d_orders.html
 **
 ** ****************************************************************************
 */

// * Modify Orders
function modifyOrdersSetCheckNow(type) {
  const orderContainer = document.querySelector(".list-result");
  orderContainer.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    const dataID = e.target.getAttribute("data-id");

    if (type === "customer") {
      db.collection("getmoco_orders")
        .doc(dataID)
        .update({
          request: "checkNow",
        })
        .then(() => {
          window.location.href = "/pages/order_details.html";
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      db.collection("getmoco_locations")
        .doc(dataID)
        .update({
          request: "checkNow",
        })
        .then(() => {
          window.location.href = "/pages/d_order_details.html";
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
}

// * Setup Orders List
function setupOrdersList(userID, type) {
  const refresh = document.querySelector(".refresh-button");
  const listResult = document.querySelector(".list-result");
  refresh.disabled = true;
  listResult.innerHTML = "";

  const select = document.querySelector(".filter-orders select");
  const selectVal = select.options[select.selectedIndex].value;

  let splitVal = selectVal.split(", ");

  if (type === "customer") {
    const dbQuery =
      splitVal[0] === "toShip"
        ? db
            .collection("getmoco_orders")
            .where("customerID", "==", userID)
            .where("shipStatus", "==", splitVal[0])
            .orderBy(splitVal[1], splitVal[2])
        : db
            .collection("getmoco_orders")
            .where("customerID", "==", userID)
            .where("shipStatus", "==", splitVal[0])
            .where("orderReceived", "==", eval(splitVal[3]))
            .orderBy(splitVal[4], splitVal[5]);

    dbQuery
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());

            renderOrdersList(doc.data(), doc.id, type);
          });
        } else {
          document.querySelector(".list-result").innerHTML =
            '<h5 class="center-align">No orders yet.</h5>';
        }
      })
      .then(() => {
        refresh.disabled = false;
      })
      .catch((error) => {
        console.log(error.message);
      });
  } else {
    db.collection("getmoco_locations")
      .where("driverID", "==", userID)
      .where("orderReceived", "==", eval(splitVal[0]))
      .orderBy(splitVal[1], splitVal[2])
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());

            renderOrdersList(doc.data(), doc.id, type, eval(splitVal[3]));
          });
        } else {
          document.querySelector(".list-result").innerHTML =
            '<h5 class="center-align">No orders yet.</h5>';
        }
      })
      .then(() => {
        refresh.disabled = false;
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
}

/**
 ** ****************************************************************************
 **
 ** set_price_list.html
 **
 ** ****************************************************************************
 */

// ? call setupChat(type) here
// ? call sendNewMessage(type) here

// * Setup Set Price List
function setupSetPriceList(customerID, orderID) {
  const showOrderID = document.querySelector(".order-id");

  showOrderID.innerHTML = orderID;

  db.collection("getmoco_items")
    .where("customerID", "==", customerID)
    .where("orderID", "==", orderID)
    .onSnapshot(
      (snapshot) => {
        // console.log(snapshot);

        if (!snapshot.empty) {
          snapshot.docChanges().forEach((change) => {
            //console.log(change, change.doc.data(), change.doc.id);

            if (change.type === "added") {
              renderSetPriceList(
                change.doc.data(),
                change.doc.id,
                orderID,
                customerID
              );
            }

            if (change.type === "modified") {
              updateSetPriceList(
                change.doc.data(),
                change.doc.id,
                orderID,
                customerID
              );
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
}

// * Modify Order Item Set Price
function modifyOrderItemSetPrice() {
  const itemContainer = document.querySelector(".order-items");
  itemContainer.addEventListener("click", (e) => {
    // console.log("e.target", e.target.className);
    // * bug = can't detect textContent

    if (e.target.className === "collapsible-header") {
      // console.log(e.target.parentElement);
      // console.log(e.target.parentElement.getAttribute("data-id"));

      const dataID = e.target.parentElement.getAttribute("data-id");

      db.collection("getmoco_items")
        .doc(dataID)
        .update({
          clientNotif: 0,
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // * bug: white space, solution: replaceAll
    if (
      e.target.className.replaceAll(/\s+/g, "") ===
      "material-iconseditmodal-trigger"
    ) {
      //console.log(e.target.parentElement);
      //console.log(e.target.parentElement.getAttribute("data-id"));

      const editForm = document.querySelector("#edit-item-form");

      editForm.reset();
      editForm
        .querySelectorAll("label")
        .forEach((item) => (item.className = "active"));

      orderItemID = "";
      orderItemID = e.target.parentElement.getAttribute("data-id");

      const item = document.querySelector(
        `.item.active[data-id="${orderItemID}"]`
      );
      const store = item.querySelector(".store").textContent;
      const product = item.querySelector(".product").textContent;
      const productDesc = item.querySelector(".productDesc").textContent;
      const quantity = item.querySelector(".quantity").textContent;
      const note = item.querySelector(".note").textContent;
      const price = item.querySelector(".price").textContent;

      editForm.store.value = store.trim();
      editForm.product.value = product.trim();
      editForm.productDesc.value = productDesc.trim();
      editForm.quantity.value = quantity.trim();
      editForm.note.value = note.trim();
      editForm.price.value = price.trim();

      db.collection("getmoco_settings")
        .where("settings", "==", "ALL")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            const priceLimit = doc.data().priceLimit;

            document.querySelector(".edit-item .price-limit").innerHTML =
              priceLimit;
          });
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  });
}

// * Edit Order Item Modal Set Price
function editOrderItemSetPrice() {
  const editForm = document.querySelector("#edit-item-form");
  const editItemModal = document.querySelector("#edit_item_modal");

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const quantity = editForm.quantity.value.trim();
    const price =
      editForm.price.value.trim() > 0.009
        ? editForm.price.value.trim()
        : "Unavailable";
    const totalPrice = parseFloat(price).toFixed(2) * quantity;

    let driverNotif = 0;

    db.collection("getmoco_items")
      .doc(orderItemID)
      .get()
      .then((doc) => {
        return (driverNotif = doc.data().driverNotif);
      })
      .then(() => {
        const data =
          price !== "Unavailable"
            ? {
                driverNotif: driverNotif + 1,
                price: parseFloat(price).toFixed(2),
                totalPrice: totalPrice.toFixed(2),
                modified: firebase.firestore.FieldValue.serverTimestamp(),
              }
            : {
                driverNotif: driverNotif + 1,
                price: price,
                totalPrice: price,
                modified: firebase.firestore.FieldValue.serverTimestamp(),
              };

        db.collection("getmoco_items")
          .doc(orderItemID)
          .update(data)
          .then(() => {
            editForm.reset();
            editForm
              .querySelectorAll("label")
              .forEach((item) => (item.className = "active"));
            const instance = M.Modal.getInstance(editItemModal);
            instance.close();
            editForm.querySelector(".error").innerHTML = "";
          })
          .then(() => {
            // Update total
            let itemsPrice = 0;
            let totalItemsPrice = 0;

            db.collection("getmoco_items")
              .where("customerID", "==", customerID)
              .where("orderID", "==", orderID)
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  const price = doc.data().price;
                  const totalPrice = parseFloat(doc.data().totalPrice);

                  if (price !== "Unavailable") {
                    itemsPrice += totalPrice;
                  }
                });
              })
              .then(() => {
                db.collection("getmoco_orders")
                  .doc(orderID)
                  .get()
                  .then((doc) => {
                    serviceFee = parseFloat(doc.data().serviceFee);

                    totalItemsPrice = itemsPrice + serviceFee;
                  })
                  .then(() => {
                    db.collection("getmoco_orders")
                      .doc(orderID)
                      .update({
                        itemsPrice: itemsPrice.toFixed(2),
                        // serviceFee: serviceFee.toFixed(2),
                        totalItemsPrice: totalItemsPrice.toFixed(2),
                      });
                  });
              })
              .catch((error) => {
                console.log(error.message);
              });
          })
          .catch((err) => {
            editForm.querySelector(
              ".error"
            ).innerHTML = `<blockquote><strong>${err.message}</strong></blockquote>`;
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
  });
}

// * Setup Client Response Cancel or Confirm
function setupClientResponse(locationID) {
  db.collection("getmoco_locations").onSnapshot(
    (snapshot) => {
      // console.log(snapshot);

      if (!snapshot.empty) {
        snapshot.docChanges().forEach((change) => {
          //console.log(change, change.doc.data(), change.doc.id);

          const docID = change.doc.id;

          if (docID === locationID) {
            if (change.type === "added" || change.type === "modified") {
              showClientResponse(change.doc.data(), change.doc.id);
            }
          }
        });
      }
    },
    (error) => {
      console.log(error);
    }
  );
}

// * Confirm Cancel Transac
function confirmCancelTransac(locationID, orderID, status) {
  const data =
    status === "delivery"
      ? {
          request: "",
          status: status,
          shipment: firebase.firestore.FieldValue.serverTimestamp(),
        }
      : {
          customerID: "",
          orderID: "",
          request: "",
          status: status,
        };

  db.collection("getmoco_locations")
    .doc(locationID)
    .update(data)
    .then(() => {
      if (status === "delivery") {
        db.collection("getmoco_orders")
          .doc(orderID)
          .update({
            shipment: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            window.location.href = "/pages/driver_delivery.html";
          });
      } else if (status === "choosing")
        window.location.href = "/pages/active_order.html";
    })
    .catch((error) => {
      console.log(error.message);
    });
}

/**
 ** ****************************************************************************
 **
 ** check_price_list.html
 **
 ** ****************************************************************************
 */

// * Send New Message
function sendNewMessage(type) {
  const chatModal = document.querySelector("#chat_modal");
  const chatForm = chatModal.querySelector("#chat_form");

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = chatForm.message.value.trim();

    const chatBy = type === "user" ? customerID : driverID;

    if (message !== "") {
      db.collection("getmoco_chats")
        .add({
          customerID: customerID,
          driverID: driverID,
          content: message,
          chatBy: chatBy,
          chatByType: type,
          created: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          chatForm.reset();
        });
    }
  });
}

// * Setup Customer Driver Chat
function setupChat(type) {
  db.collection("getmoco_chats")
    .orderBy("created", "asc")
    .onSnapshot(
      (snapshot) => {
        // console.log(snapshot);

        if (!snapshot.empty) {
          snapshot.docChanges().forEach((change) => {
            //console.log(change, change.doc.data(), change.doc.id);

            if (change.type === "added") {
              renderChats(change.doc.data(), change.doc.id, type);
              //console.log(change.doc.data(), change.doc.id);

              // const chatModal = document.querySelector("#chat_modal");
              // const listResult = chatModal.querySelector(".list-result");
              // listResult.innerHTML += `${change.doc.data().chatByType}, `;
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
}

// * Setup Wait Price List
function setupWaitPriceList(customerID, orderID) {
  const showOrderID = document.querySelector(".order-id");
  const cancelButton = document.querySelector(".cancel-button");
  const confirmButton = document.querySelector(".confirm-button");

  showOrderID.innerHTML = orderID;
  cancelButton.disabled = true;
  confirmButton.disabled = true;

  db.collection("getmoco_items")
    .where("customerID", "==", customerID)
    .where("orderID", "==", orderID)
    .onSnapshot(
      (snapshot) => {
        // console.log(snapshot);

        if (!snapshot.empty) {
          snapshot.docChanges().forEach((change) => {
            //console.log(change, change.doc.data(), change.doc.id);

            if (change.type === "added") {
              renderGetPriceList(
                change.doc.data(),
                change.doc.id,
                orderID,
                customerID
              );
            }

            if (change.type === "modified") {
              updateGetPriceList(
                change.doc.data(),
                change.doc.id,
                orderID,
                customerID
              );
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
}

// * Modify Order Item For Price
function modifyOrderItemForPrice() {
  const itemContainer = document.querySelector(".order-items");
  itemContainer.addEventListener("click", (e) => {
    // console.log("e.target", e.target.className);
    // * bug = can't detect textContent

    if (e.target.className === "collapsible-header") {
      // console.log(e.target.parentElement);
      // console.log(e.target.parentElement.getAttribute("data-id"));

      const dataID = e.target.parentElement.getAttribute("data-id");

      db.collection("getmoco_items")
        .doc(dataID)
        .update({
          driverNotif: 0,
        })
        .catch((err) => {
          console.log(err);
        });
    }

    // * bug: white space, solution: replaceAll
    if (
      e.target.className.replaceAll(/\s+/g, "") ===
      "material-iconseditmodal-trigger"
    ) {
      //console.log(e.target.parentElement);
      //console.log(e.target.parentElement.getAttribute("data-id"));

      const editForm = document.querySelector("#edit-item-form");

      editForm.reset();
      editForm
        .querySelectorAll("label")
        .forEach((item) => (item.className = "active"));

      orderItemID = "";
      orderItemID = e.target.parentElement.getAttribute("data-id");

      const item = document.querySelector(
        `.item.active[data-id="${orderItemID}"]`
      );
      const store = item.querySelector(".store").textContent;
      const product = item.querySelector(".product").textContent;
      const productDesc = item.querySelector(".productDesc").textContent;
      const quantity = item.querySelector(".quantity").textContent;
      const note = item.querySelector(".note").textContent;
      const price = item.querySelector(".price").textContent;
      const totalPrice = item.querySelector(".totalPrice").textContent;

      editForm.store.value = store.trim();
      editForm.product.value = product.trim();
      editForm.productDesc.value = productDesc.trim();
      editForm.quantity.value = quantity.trim();
      editForm.note.value = note.trim();
      editForm.price.value = price.trim();
      editForm.totalPrice.value = totalPrice.trim();

      db.collection("getmoco_settings")
        .where("settings", "==", "ALL")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            const priceLimit = doc.data().priceLimit;

            document.querySelector(".edit-item .price-limit").innerHTML =
              priceLimit;
          });
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  });
}

// * Edit Order Item Modal For Price
function editOrderItemForPrice() {
  const editForm = document.querySelector("#edit-item-form");
  const editItemModal = document.querySelector("#edit_item_modal");

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const quantity = editForm.quantity.value.trim();
    const price = editForm.price.value.trim();
    const totalPrice = parseFloat(price).toFixed(2) * quantity;

    let clientNotif = 0;
    db.collection("getmoco_items")
      .doc(orderItemID)
      .get()
      .then((doc) => {
        return (clientNotif = doc.data().clientNotif);
      })
      .then(() => {
        const data =
          price !== "Unavailable"
            ? {
                quantity: quantity,
                clientNotif: clientNotif + 1,
                totalPrice: totalPrice.toFixed(2),
                modified: firebase.firestore.FieldValue.serverTimestamp(),
              }
            : {
                quantity: quantity,
                clientNotif: clientNotif + 1,
                modified: firebase.firestore.FieldValue.serverTimestamp(),
              };

        db.collection("getmoco_items")
          .doc(orderItemID)
          .update(data)
          .then(() => {
            editForm.reset();
            editForm
              .querySelectorAll("label")
              .forEach((item) => (item.className = "active"));
            const instance = M.Modal.getInstance(editItemModal);
            instance.close();
            editForm.querySelector(".error").innerHTML = "";
          })
          .then(() => {
            // Update total
            let itemsPrice = 0;
            let serviceFee = 0;
            let totalItemsPrice = 0;

            db.collection("getmoco_items")
              .where("customerID", "==", customerID)
              .where("orderID", "==", orderID)
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  const price = doc.data().price;
                  const totalPrice = parseFloat(doc.data().totalPrice);

                  if (price !== "Unavailable") {
                    itemsPrice += totalPrice;
                  }
                });
              })
              .then(() => {
                db.collection("getmoco_orders")
                  .doc(orderID)
                  .get()
                  .then((doc) => {
                    serviceFee = parseFloat(doc.data().serviceFee);

                    totalItemsPrice = itemsPrice + serviceFee;
                  })
                  .then(() => {
                    db.collection("getmoco_orders")
                      .doc(orderID)
                      .update({
                        itemsPrice: itemsPrice.toFixed(2),
                        // serviceFee: serviceFee.toFixed(2),
                        totalItemsPrice: totalItemsPrice.toFixed(2),
                      });
                  });
              })
              .catch((error) => {
                console.log(error.message);
              });
          })
          .catch((err) => {
            editForm.querySelector(
              ".error"
            ).innerHTML = `<blockquote><strong>${err.message}</strong></blockquote>`;
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
  });
}

// * Check Order Status Now
function checkOrderStatusNow(request, orderID) {
  db.collection("getmoco_orders")
    .doc(orderID)
    .update({ request: request })
    .then(() => {
      window.location.href = `/pages/order_details.html`;
    })
    .catch((err) => {
      console.log(err.message);
    });
}

// * Confirm Get Price List
function confirmWaitPriceList(orderID, locationID) {
  const confirmButton = document.querySelector(".yes-confirm-button");
  confirmButton.addEventListener("click", () => {
    db.collection("getmoco_orders")
      .doc(orderID)
      .update({
        status: "toPay",
        orderConfirmed: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        db.collection("getmoco_locations")
          .doc(locationID)
          .update({
            request: "confirmed",
            // status: "payment",
            orderConfirmed: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            const orderConfirmedModal = document.querySelector(
              "#order_confirmed_modal"
            );
            const instance = M.Modal.getInstance(orderConfirmedModal);
            instance.options.dismissible = false;
            instance.open();
          })
          .catch((error) => {
            console.log(error.message);
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
  });
}

// * Cancel Get Price List
function cancelWaitPriceList(orderID, locationID, driverID, customerID) {
  const cancelButton = document.querySelector(".yes-cancel-button");
  cancelButton.addEventListener("click", () => {
    let serviceFee = 0;
    let totalItemsPrice = 0;

    db.collection("getmoco_orders")
      .doc(orderID)
      .get()
      .then((doc) => {
        serviceFee = parseFloat(doc.data().serviceFee);

        totalItemsPrice = parseFloat(doc.data().totalItemsPrice);
      })
      .then(() => {
        db.collection("getmoco_orders")
          .doc(orderID)
          .update({
            itemsPrice: "0.00",
            totalItemsPrice: serviceFee.toFixed(2).toString(), // same as service fee
            driverID: "",
            status: "waiting",
            waiting: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            db.collection("getmoco_items")
              .where("orderID", "==", orderID)
              .get()
              .then((snaphot) => {
                if (!snaphot.empty) {
                  snaphot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    // console.log(doc.id, " => ", doc.data());

                    const itemID = doc.id;
                    db.collection("getmoco_items").doc(itemID).update({
                      price: "0.00",
                      totalPrice: "0.00",
                      clientNotif: 0,
                      driverNotif: 0,
                      modified: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                  });
                }
              })
              .then(() => {
                db.collection("getmoco_locations")
                  .doc(locationID)
                  .update({
                    request: "cancelled",
                    // status: "waiting",
                  })
                  .then(() => {
                    window.location.href = "/pages/wait_driver.html";
                  })
                  .catch((error) => {
                    console.log(error.message);
                  });
              });
          });
      });
  });
}

/**
 ** ****************************************************************************
 **
 ** active_order.html
 **
 ** ****************************************************************************
 */

// * Setup Waiting for Client Request
function setupNewOrders() {
  db.collection("getmoco_orders")
    .orderBy("created", "asc")
    .onSnapshot(
      (snapshot) => {
        // console.log(snapshot);

        if (!snapshot.empty) {
          snapshot.docChanges().forEach((change) => {
            //console.log(change, change.doc.data(), change.doc.id);

            if (change.type === "added") {
              //console.log(`${change.doc.id} is added`);

              renderNewOrder(change.doc.data(), change.doc.id);
            }

            if (change.type === "modified") {
              //console.log(`${change.doc.id} is modified`);

              updateNewOrder(change.doc.data(), change.doc.id);
            }

            if (change.type === "removed") {
              //console.log(`${change.doc.id} is removed`);

              removeNewOrder(change.doc.id);
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
}

// * Choose New Order
function chooseNewOrder() {
  const listContainer = document.querySelector(".list-result");
  const takeOrderButton = document.querySelector(
    "#view_customer_modal .take-order-button"
  );

  listContainer.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    const viewCustomer = document.querySelector("#view_customer_modal");

    activeOrderID = "";
    activeOrderID = e.target.getAttribute("data-id");

    const customer = document.querySelector(
      `.customer[data-id="${activeOrderID}"]`
    );
    const name = customer.querySelector(".name").textContent;
    const addressOrg = customer.querySelector(".addressOrg").textContent;
    const landmarkOrg = customer.querySelector(".landmarkOrg").textContent;
    const date = customer.querySelector(".date").textContent;
    const img = customer.querySelector(".customer-img").src;
    const addressDrp = customer.querySelector(".addressDrp").textContent;
    const landmarkDrp = customer.querySelector(".landmarkDrp").textContent;
    const totalDistance = customer.querySelector(".totalDistance").textContent;
    const serviceFee = customer.querySelector(".serviceFee").textContent;

    viewCustomer.querySelector(".name").textContent = name;
    viewCustomer.querySelector(".addressOrg").textContent = addressOrg;
    viewCustomer.querySelector(".landmarkOrg").textContent = landmarkOrg;
    viewCustomer.querySelector(".date").textContent = date;
    viewCustomer.querySelector(".customer-img").src = img;
    viewCustomer.querySelector(".addressDrp").textContent = addressDrp;
    viewCustomer.querySelector(".landmarkDrp").textContent = landmarkDrp;
    viewCustomer.querySelector(".totalDistance").textContent = totalDistance;
    viewCustomer.querySelector(".serviceFee").textContent = serviceFee;

    const takeOrderButton = viewCustomer.querySelector(".take-order-button");

    takeOrderButton.disabled = false;

    viewCustomer.querySelector(".error").innerHTML = "";

    const itemsListContainer = document.querySelector(".items-list");
    const orderItemsContainer =
      itemsListContainer.querySelector(".order-items");

    orderItemsContainer.innerHTML = "";

    db.collection("getmoco_orders")
      .doc(activeOrderID)
      .get()
      .then((doc) => {
        //setupOrderDetails(activeOrderID, "driver"); // called from d_order_details.html
        setOrderItems(doc.data().customerID, activeOrderID); // called from d_order_details.html
      });
  });

  takeOrderButton.addEventListener("click", () => {
    const viewCustomer = document.querySelector("#view_customer_modal");
    const errorReq = viewCustomer.querySelector(".error");

    db.collection("getmoco_orders")
      .doc(activeOrderID)
      .get()
      .then((doc) => {
        const status = doc.data().status;

        if (status === "waiting") {
          let customerID;
          let dmOrigin;
          let dmDestination;
          let province;
          let city;
          let addressOrg;
          let brgyOrg;
          let houseOrg;
          let streetOrg;
          let zipOrg;
          let landmarkOrg;
          let addressDrp;
          let brgyDrp;
          let houseDrp;
          let streetDrp;
          let zipDrp;
          let landmarkDrp;
          let totalDistance;

          db.collection("getmoco_orders")
            .doc(activeOrderID)
            .get()
            .then((doc) => {
              customerID = doc.data().customerID;
              dmOrigin = doc.data().dmOrigin;
              dmDestination = doc.data().dmDestination;
              province = doc.data().province;
              city = doc.data().city;

              addressOrg = doc.data().addressOrg;
              brgyOrg = doc.data().brgyOrg;
              houseOrg = doc.data().houseOrg;
              streetOrg = doc.data().streetOrg;
              zipOrg = doc.data().zipOrg;
              landmarkOrg = doc.data().landmarkOrg;

              addressDrp = doc.data().addressDrp;
              brgyDrp = doc.data().brgyDrp;
              houseDrp = doc.data().houseDrp;
              streetDrp = doc.data().streetDrp;
              zipDrp = doc.data().zipDrp;
              landmarkDrp = doc.data().landmarkDrp;
              totalDistance = doc.data().totalDistance;
            })
            .then(() => {
              db.collection("getmoco_locations").doc(locationID).update({
                customerID: customerID,
                orderID: activeOrderID,
                dmOrigin: dmOrigin,
                dmDestination: dmDestination,
                province: province,
                city: city,
                addressOrg: addressOrg,
                brgyOrg: brgyOrg,
                houseOrg: houseOrg,
                streetOrg: streetOrg,
                zipOrg: zipOrg,
                landmarkOrg: landmarkOrg,
                addressDrp: addressDrp,
                brgyDrp: brgyDrp,
                houseDrp: houseDrp,
                streetDrp: streetDrp,
                zipDrp: zipDrp,
                landmarkDrp: landmarkDrp,
                totalDistance: totalDistance,
                status: "transac",
                transac: firebase.firestore.FieldValue.serverTimestamp(),
              });
              db.collection("getmoco_orders")
                .doc(activeOrderID)
                .update({
                  driverID: driverID,
                  locationID: locationID,
                  status: "transac",
                  transac: firebase.firestore.FieldValue.serverTimestamp(),
                })
                .then(() => {
                  errorReq.innerHTML = `<blockquote class="green-text"><strong>Processing... Please Wait.</strong></blockquote>`;

                  window.location.href = "/pages/set_price_list.html";
                });
            });
        } else {
          errorReq.innerHTML = `<blockquote class="red-text"><strong>The customer order is no longer available.</strong></blockquote>`;
        }
      });
  });
}

/**
 ** ****************************************************************************
 **
 ** wait_driver.html
 **
 ** ****************************************************************************
 */

// * Setup Driver List
function setupWaitDriver() {
  db.collection("getmoco_orders")
    .doc(orderID)
    .onSnapshot(
      (doc) => {
        renderWaitingOrder(doc.data(), doc.id);
      },
      (err) => {
        console.log(err);
      }
    );
}

/**
 ** ****************************************************************************
 **
 ** order.html
 **
 ** ****************************************************************************
 */

// * Setup Item List
function setupItemsList(customerID, orderID) {
  db.collection("getmoco_items")
    .where("customerID", "==", customerID)
    .where("orderID", "==", orderID)
    .onSnapshot(
      (snapshot) => {
        // console.log(snapshot);

        if (!snapshot.empty) {
          snapshot.docChanges().forEach((change) => {
            //console.log(change, change.doc.data(), change.doc.id);

            if (change.type === "added") {
              //console.log(`${change.doc.id} is added`);

              renderOrderItem(change.doc.data(), change.doc.id);
              removeSampleItem();
            }

            if (change.type === "removed") {
              //console.log(`${change.doc.id} is removed`);

              removeOrderItem(change.doc.id);
              removeSampleItem();
            }

            if (change.type === "modified") {
              //console.log(`${change.doc.id} is modified`);

              updateOrderItem(change.doc.data(), change.doc.id);
              //removeSampleItem();
            }
          });
        } else {
          renderSampleItem();
        }
      },
      (error) => {
        console.log(error);
      }
    );
}

// * Modify Order Item
function modifyOrderItem() {
  const itemContainer = document.querySelector(".order-items");
  itemContainer.addEventListener("click", (e) => {
    // console.log("e.target", e.target);
    // * bug = can't detect textContent

    if (e.target.className === "material-icons tooltipped delete") {
      //console.log(e.target.parentElement);
      //console.log(e.target.parentElement.getAttribute("data-id"));

      const id = e.target.parentElement.getAttribute("data-id");
      db.collection("getmoco_items")
        .doc(id)
        .delete()
        .catch((error) => {
          console.log(error.message);
        });
    }

    if (e.target.className === "material-icons modal-trigger tooltipped edit") {
      //console.log(e.target.parentElement);
      //console.log(e.target.parentElement.getAttribute("data-id"));

      const editForm = document.querySelector("#edit-item-form");

      editForm.reset();
      editForm
        .querySelectorAll("label")
        .forEach((item) => (item.className = "active"));

      orderItemID = "";
      orderItemID = e.target.parentElement.getAttribute("data-id");

      const item = document.querySelector(
        `.item.active[data-id="${orderItemID}"]`
      );
      const store = item.querySelector(".store").textContent;
      const product = item.querySelector(".product").textContent;
      const productDesc = item.querySelector(".productDesc").textContent;
      const quantity = item.querySelector(".quantity").textContent;
      const note = item.querySelector(".note").textContent;

      editForm.store.value = store.trim();
      editForm.product.value = product.trim();
      editForm.productDesc.value = productDesc.trim();
      editForm.quantity.value = quantity.trim();
      editForm.note.value = note.trim();

      // Process Validation
      db.collection("getmoco_settings")
        .where("settings", "==", "ALL")
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            const priceLimit = doc.data().priceLimit;

            editForm.querySelector(".price-limit").innerHTML = priceLimit;
          });
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  });
}

// * Edit Order Item Modal
function editOrderItem() {
  const editForm = document.querySelector("#edit-item-form");
  const editItemModal = document.querySelector("#edit_item_modal");
  const editFormError = editForm.querySelector(".error");

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get info
    const productDesc =
      editForm.productDesc.value.trim() === "" ||
      editForm.productDesc.value.toUpperCase().trim() === "NONE"
        ? "None"
        : editForm.productDesc.value.trim();
    const note =
      editForm.note.value.trim() === "" ||
      editForm.note.value.toUpperCase().trim() === "NONE"
        ? "None"
        : editForm.note.value.trim();
    const store =
      editForm.store.value.trim() === "" ||
      editForm.store.value.toUpperCase().trim() === "NONE"
        ? "None"
        : editForm.store.value.trim();
    const product = editForm.product.value.trim();
    const quantity = editForm.quantity.value.trim();

    const items = {
      store: store,
      product: product,
      productDesc: productDesc,
      quantity: quantity,
      note: note,
      modified: firebase.firestore.FieldValue.serverTimestamp(),
    };

    db.collection("getmoco_items")
      .doc(orderItemID)
      .update(items)
      .then(() => {
        editForm.reset();
        const instance = M.Modal.getInstance(editItemModal);
        instance.close();
        editFormError.innerHTML = "";
      })
      .catch((err) => {
        editFormError.innerHTML = `<blockquote><strong>${err.message}</strong></blockquote>`;
      });
  });
}

// * Add Order Item Modal
function addOrderItem(customerID, orderID) {
  const addForm = document.querySelector("#add-item-form");
  const addItemModal = document.querySelector("#add_item_modal");
  const addFormError = addForm.querySelector(".error");

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get info
    const productDesc =
      addForm.productDesc.value.trim() === "" ||
      addForm.productDesc.value.toUpperCase().trim() === "NONE"
        ? "None"
        : addForm.productDesc.value.trim();
    const note =
      addForm.note.value.trim() === "" ||
      addForm.note.value.toUpperCase().trim() === "NONE"
        ? "None"
        : addForm.note.value.trim();
    const store =
      addForm.store.value.trim() === "" ||
      addForm.store.value.toUpperCase().trim() === "NONE"
        ? "None"
        : addForm.store.value.trim();
    const product = addForm.product.value.trim();
    const quantity = addForm.quantity.value.trim();

    const items = {
      customerID: customerID,
      orderID: orderID,
      store: store,
      product: product,
      productDesc: productDesc,
      quantity: quantity,
      note: note,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      price: "0.00",
      totalPrice: "0.00",
      clientNotif: 0,
      driverNotif: 0,
    };

    db.collection("getmoco_items")
      .add(items)
      .then(() => {
        addForm.reset();
        const instance = M.Modal.getInstance(addItemModal);
        instance.close();
        addFormError.innerHTML = "";
      })
      .catch((err) => {
        addFormError.innerHTML = `<blockquote><strong>${err.message}</strong></blockquote>`;
      });
  });
}

// * Check Weight and Service Fee
function checkWeightServiceFee(orderID) {
  const weightModal = document.querySelector("#weight_modal");
  const weightForm = weightModal.querySelector("#weight-form");
  const weightRange = weightForm.querySelector("#weight-range");
  const weightValue = weightForm.querySelector(".weight-value");
  const change = weightForm.querySelector("#change");

  weightForm.reset();

  db.collection("getmoco_orders")
    .doc(orderID)
    .get()
    .then((doc) => {
      const totalWeight = doc.data().totalWeight;
      const docChange = parseFloat(doc.data().change);

      weightRange.value = totalWeight;
      weightValue.innerHTML = totalWeight;

      change.value = docChange;
    });
}

// * Next - choose send items list
function nextBackCustomer(orderID, status) {
  const nextBack = document.querySelector(".next-back-customer");

  if (status === "current") {
    nextBack.addEventListener("click", () => {
      db.collection("getmoco_orders")
        .doc(orderID)
        .update({
          status: status,
        })
        .then(() => {
          if (status === "waiting")
            window.location.href = "/pages/wait_driver.html";
          else window.location.href = "/pages/order.html";
        })
        .catch((err) => {
          console.log(err.message);
        });
    });
  } else {
    const weightModal = document.querySelector("#weight_modal");
    const weightForm = weightModal.querySelector("#weight-form");

    weightForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const weightRange = weightForm.querySelector("#weight-range");
      const weight = weightRange.value.trim();

      const change = weightForm.change.value.trim();

      db.collection("getmoco_orders")
        .doc(orderID)
        .update({
          status: status,
          totalWeight: weight,
          change: parseFloat(change).toFixed(2).toString(),
          waiting: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          if (status === "waiting")
            window.location.href = "/pages/wait_driver.html";
          else window.location.href = "/pages/order.html";
        })
        .catch((err) => {
          console.log(err.message);
        });
    });
  }
}

// ? Also used in active_order.html
// * Cancel Pin Location
function cancelPinLocation(userID, currentID, type) {
  const cancelPinLoc = document.querySelector(".cancel-pin-location");
  cancelPinLoc.addEventListener("click", () => {
    if (type === "user") {
      db.collection("getmoco_items")
        .where("customerID", "==", userID)
        .where("orderID", "==", currentID)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc2) => {
            // doc2.data() is never undefined for query doc snapshots
            // console.log(doc2.id, " => ", doc2.data());

            doc2.ref.delete();
          });
        })
        .then(() => {
          db.collection("getmoco_orders")
            .doc(currentID)
            .delete()
            .then(() => {
              return (orderID = "");
            })
            .then(() => {
              window.location.href = "/pages/home.html";
            })
            .catch((error) => {
              console.log(error.message);
            });
        })
        .catch((error) => {
          console.log(error.message);
        });
    } else {
      db.collection("getmoco_locations")
        .doc(currentID)
        .delete()
        .then(() => {
          window.location.href = "/pages/driver.html";
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  });
}

/**
 ** ****************************************************************************
 **
 ** home.html / driver.html
 **
 ** ****************************************************************************
 */

// * Setup User Verified
function setupUserVerified(userID, type) {
  db.collection("getmoco_users")
    .doc(userID)
    .onSnapshot(
      (doc) => {
        renderUserVerified(doc.data(), doc.id, type);
      },
      (err) => {
        console.log(err);
      }
    );
}

// * Calculate Distance
function calculateDistance(origin, destination) {
  //const accessToken = "4e5JlBCrZzqIniPGkkIqOIuZ0HkIW"; // patrick tup email token
  const accessToken = "nkkUZdOpjpxbqpZGfIZD0XBNR2iCT";

  // api url: distancematrix.ai
  const api_url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${accessToken}`;

  // Defining async function
  async function getapi(url) {
    // Storing response
    const response = await fetch(url);

    // Storing data in form of JSON
    let data = await response.json();
    // console.log(data);
    // console.log(data.origin_addresses[0]);
    // console.log(data.destination_addresses[0]);
    // console.log(data.rows[0].elements[0].distance);
    // console.log(data.rows[0].elements[0].duration);
    // console.log(data.rows[0].elements[0].distance.value);

    return data.rows[0].elements[0].distance.value / 1000;
  }

  // Call Async
  return getapi(api_url);
}

// * Pin Location
function pinLocation(userID, type) {
  const pinLocForm = document.querySelector("#pin-location-form");
  pinLocForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (type === "user") {
      const province = setProv;
      const city = setCity;

      const townOrg = pinLocForm
        .querySelector(`.origin-container div[data-id="${settingsLoc}"] select`)
        .value.trim();
      let splitTownOrg = townOrg.split(" | ");
      const brgyOrg = splitTownOrg[1];
      const zipOrg = splitTownOrg[2];

      const streetOrg = pinLocForm.streetOrg.value.trim();
      const houseOrg = pinLocForm.houseOrg.value.trim();
      const landmarkOrg = pinLocForm.landmarkOrg.value.trim();
      const addressOrg =
        houseOrg !== "" || streetOrg !== ""
          ? houseOrg +
            " " +
            streetOrg +
            ", " +
            brgyOrg +
            ", " +
            settingsLoc +
            " " +
            zipOrg
          : brgyOrg + ", " + settingsLoc + " " + zipOrg;

      const useCurrent = pinLocForm.useCurrent.checked;

      if (!useCurrent) {
        const townDrp = pinLocForm
          .querySelector(
            `.dropoff-container div[data-id="${settingsLoc}"] select`
          )
          .value.trim();
        let splitTownDrp = townDrp.split(" | ");
        brgyDrp = splitTownDrp[1];
        zipDrp = splitTownDrp[2];

        streetDrp = pinLocForm.streetDrp.value.trim();
        houseDrp = pinLocForm.houseDrp.value.trim();
        landmarkDrp = pinLocForm.landmarkDrp.value.trim();

        dmDestination = splitTownDrp[0];
      } else {
        // data set in useCurrentAddress()
      }

      const addressDrp =
        houseDrp +
        " " +
        streetDrp +
        ", " +
        brgyDrp +
        ", " +
        settingsLoc +
        " " +
        zipDrp;

      const dmOrigin = splitTownOrg[0];

      // Calling that async function
      const getDistance = calculateDistance(dmOrigin, dmDestination);
      // console.log(getDistance);

      getDistance.then((val) => {
        // console.log(val);
        const totalDistance = val.toFixed(2);

        let serviceFee = 0;

        db.collection("getmoco_settings")
          .where("settings", "==", "ALL")
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              const priceMatrix = parseFloat(doc.data().priceMatrix);

              if (totalDistance >= 0 && totalDistance <= 5) {
                serviceFee = 40;
              } else if (totalDistance >= 5.01 && totalDistance <= 20) {
                if (totalDistance === 5.01) {
                  serviceFee = 70;
                } else {
                  // 5.01k min, +6php(example)

                  serviceFee = 70;

                  const distance =
                    totalDistance > 5.01
                      ? totalDistance - 5.01
                      : 5.01 - totalDistance;

                  const addPrice = distance * priceMatrix;

                  serviceFee += addPrice;
                }
              } else {
                // 20.01km min, +6php(example)

                serviceFee = 170;

                const distance =
                  totalDistance > 20.01
                    ? totalDistance - 20.01
                    : 20.01 - totalDistance;

                const addPrice = distance * priceMatrix;

                serviceFee += addPrice;
              }

              // console.log("Fee: " + serviceFee);
            });
          })
          .then(() => {
            db.collection("getmoco_orders")
              .add({
                customerID: userID,
                dmDestination: dmDestination,
                dmOrigin: dmOrigin,
                province: province,
                city: city,
                addressOrg: addressOrg,
                zipOrg: zipOrg,
                brgyOrg: brgyOrg,
                streetOrg: streetOrg,
                houseOrg: houseOrg,
                landmarkOrg: landmarkOrg,
                addressDrp: addressDrp,
                zipDrp: zipDrp,
                brgyDrp: brgyDrp,
                streetDrp: streetDrp,
                houseDrp: houseDrp,
                landmarkDrp: landmarkDrp,
                status: "current",
                created: firebase.firestore.FieldValue.serverTimestamp(),
                transac: "",
                itemsPrice: "0.00",
                serviceFee: serviceFee.toFixed(2),
                totalItemsPrice: serviceFee.toFixed(2),
                driverID: "",
                request: "",
                shipStatus: "toShip",
                orderReceived: false,
                delivered: "",
                shipment: "",
                received: "",
                waiting: "",
                totalWeight: 0,
                totalDistance: totalDistance,
                change: "",
                orderConfirmed: "",
                driverEarning: "0.00",
                appEarning: "0.00",
              })
              .then(() => {
                window.location.href = "/pages/order.html";
              });
          });
      });
    } else {
      db.collection("getmoco_locations")
        .add({
          driverID: userID,
          dmDestination: "",
          dmOrigin: "",
          province: "",
          city: "",
          addressOrg: "",
          zipOrg: "",
          brgyOrg: "",
          streetOrg: "",
          houseOrg: "",
          landmarkOrg: "",
          addressDrp: "",
          zipDrp: "",
          brgyDrp: "",
          streetDrp: "",
          houseDrp: "",
          landmarkDrp: "",
          totalDistance: "",
          status: "choosing",
          request: "",
          customerID: "",
          orderID: "",
          shipment: "",
          delivered: "",
          created: firebase.firestore.FieldValue.serverTimestamp(),
          orderReceived: false,
          received: "",
          orderConfirmed: "",
          driverEarning: "0.00",
          appEarning: "0.00",
        })
        .then(() => {
          window.location.href = "/pages/active_order.html";
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  });
}

/**
 ** ****************************************************************************
 **
 ** index.html
 **
 ** ****************************************************************************
 */

// * Matrix Settings
function setupMatrix() {
  db.collection("getmoco_settings")
    .doc("settings")
    .get()
    .then((doc) => {
      if (doc.exists) {
        setProv = doc.data().province;
        setCity = doc.data().city;
        settingsLoc = setCity + ", " + setProv;

        const signupButton = document.querySelector(
          "#login-form #signup-button"
        );

        if (
          (setProv !== "" || setProv !== undefined || setProv !== null) &&
          (setCity !== "" || setCity !== undefined || setCity !== null)
        ) {
          const selectOptions = document.querySelector(
            `#signup-form div[data-id="${settingsLoc}"]`
          );

          if (selectOptions) {
            selectOptions.style.display = "block";
            signupButton.removeAttribute("disabled");
          } else {
            signupButton.setAttribute("disabled", "disabled");
          }
        } else {
          signupButton.setAttribute("disabled", "disabled");
        }
      } else {
        const signupButton = document.querySelector(
          "#login-form #signup-button"
        );
        signupButton.setAttribute("disabled", "disabled");

        db.collection("getmoco_settings")
          .doc("settings")
          .set({
            city: "",
            platformFee: "0",
            priceLimit: "0",
            priceMatrix: "0",
            province: "",
            settings: "ALL",
            totalEarnings: "0.00",
          })
          .then((doc) => {
            auth
              .createUserWithEmailAndPassword("admin@getmoco.com", "admin1")
              .then((cred) => {
                // console.log(cred.user);
                let profile = {};

                profile = {
                  fname: "Admin",
                  lname: "1",
                  contact: "None",
                  address: "None",
                  zip: "",
                  province: "",
                  city: "",
                  brgy: "",
                  street: "",
                  house: "",
                  landmark: "",
                  type: "admin",
                  email: "admin@getmoco.com",
                  password: "admin1",
                  created: firebase.firestore.FieldValue.serverTimestamp(),
                };

                // Store bio
                db.collection("getmoco_users").doc(cred.user.uid).set(profile);
              });
          });
      }
    });
}

// * Logout
function logout() {
  const logout = document.querySelectorAll(".logout");
  logout.forEach((logout) => {
    logout.addEventListener("click", (e) => {
      //e.preventDefault();

      auth
        .signOut()
        .then(() => {
          //console.log("user log out");

          // Reset
          const sideNav = document.querySelectorAll(".sidenav");
          sideNav.forEach((sideNav) => {
            M.Sidenav.getInstance(sideNav).close();
          });
        })
        .catch((error) => {
          console.log(error.code, error.message);
        });
    });
  });
}

// * Login
function login() {
  const loginForm = document.querySelector("#login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get user info
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    // Login with user
    auth
      .signInWithEmailAndPassword(email, password)
      .then((cred) => {
        // console.log(cred.user);

        // Reset form
        loginForm.reset();
        loginForm.querySelector(".error").innerHTML = "";
        loginForm["email"].disabled = true;
        loginForm["password"].disabled = true;
      
        window.location.href = "/pages/home.html";
      })
      .catch((error) => {
        loginForm.querySelector(
          ".error"
        ).innerHTML = `<blockquote><strong>${error.message}</strong></blockquote>`;
      });
  });
}

// * Signup
function signup(type) {
  const signupForm = document.querySelector("#signup-form");
  const signupModal = document.querySelector("#signup-modal");
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get user info
    const signupFormError = signupForm.querySelector(".error");
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value.trim();
    const cPassword = signupForm.confirm_password.value.trim();
    let tempf = signupForm.firstName.value.trim();
    const fname = tempf.charAt(0).toUpperCase() + tempf.slice(1).toLowerCase();
    let templ = signupForm.lastName.value.trim();
    const lname = templ.charAt(0).toUpperCase() + templ.slice(1).toLowerCase();
    const contact = signupForm.contact.value.trim();

    // const province = signupForm.province.value.trim();
    // const city = signupForm.city.value.trim();
    const province = setProv;
    const city = setCity;
    const town = signupForm
      .querySelector(`div[data-id="${settingsLoc}"] select`)
      .value.trim();
    let splitVal = town.split(" | ");
    const dmDestination = splitVal[0];
    const brgy = splitVal[1];
    const zip = splitVal[2];

    const street = signupForm.street.value.trim();
    const house = signupForm.house.value.trim();
    const landmark = signupForm.landmark.value.trim();
    const address =
      house + " " + street + ", " + brgy + ", " + settingsLoc + " " + zip;

    // const type = signupForm.type.value.trim();

    let drvLicense = "";
    let drvPlate = "";

    if (type === "driver") {
      const tempDrvLicense = signupForm.drvLicense.value.trim();
      const tempDrvPlate = signupForm.drvPlate.value.trim();
      drvLicense = tempDrvLicense.toUpperCase();
      drvPlate = tempDrvPlate.toUpperCase();
    } else {
      drvLicense = "";
      drvPlate = "";
    }

    let proceedContact = false;
    let proceedPass = false;
    let tempContact = "";

    // Process Validation
    db.collection("getmoco_users")
      .where("type", "in", ["user", "driver"])
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          // console.log(doc.id, " => ", doc.data());

          if (doc.data().contact === contact) return (tempContact = contact);
        });
      })
      .then(() => {
        // Contact
        if (tempContact !== contact) {
          proceedContact = true;
          //signupFormError.innerHTML = "";
        } else {
          proceedContact = false;
          signupFormError.innerHTML = `<blockquote><strong>The mobile number is already registered.</strong></blockquote>`;
        }
        // Password
        if (password === cPassword) {
          proceedPass = true;
          //signupFormError.innerHTML = "";
        } else {
          proceedPass = false;
          signupFormError.innerHTML = `<blockquote><strong>Password do not match.</strong></blockquote>`;
        }

        // Clear error field
        if (tempContact !== contact && password === cPassword)
          signupFormError.innerHTML = "";

        //console.log(doc.data(), tempContact, contact, password, cPassword);
        //console.log(proceedContact, proceedPass);
      })
      .then(() => {
        // Signup with user
        if (proceedContact && proceedPass) {
          auth
            .createUserWithEmailAndPassword(email, password)
            .then((cred) => {
              // console.log(cred.user);
              let profile = {};

              if (type === "user") {
                profile = {
                  fname: fname,
                  lname: lname,
                  contact: contact,
                  dmDestination: dmDestination,
                  address: address,
                  zip: zip,
                  province: province,
                  city: city,
                  brgy: brgy,
                  street: street,
                  house: house,
                  landmark: landmark,
                  type: type,
                  verified: "unverified",
                  toVerify: "",
                  verify: "",
                  status: "active",
                  email: email,
                  password: password,
                  disabled: "",
                  inactive: "",
                  totalSpent: "0.00",
                  created: firebase.firestore.FieldValue.serverTimestamp(),
                };
              } else {
                profile = {
                  fname: fname,
                  lname: lname,
                  contact: contact,
                  dmDestination: dmDestination,
                  address: address,
                  zip: zip,
                  province: province,
                  city: city,
                  brgy: brgy,
                  street: street,
                  house: house,
                  landmark: landmark,
                  type: type,
                  drvLicense: drvLicense,
                  drvPlate: drvPlate,
                  verified: "unverified",
                  toVerify: "",
                  verify: "",
                  status: "active",
                  email: email,
                  password: password,
                  disabled: "",
                  inactive: "",
                  totalEarnings: "0.00",
                  created: firebase.firestore.FieldValue.serverTimestamp(),
                };
              }

              // Store bio
              db.collection("getmoco_users").doc(cred.user.uid).set(profile);
            })
            .then((userCred) => {
              // console.log(userCred.user);

              // Reset Form
              signupForm.reset();
              //signupForm.querySelector(".error").innerHTML = "";
              signupFormError.innerHTML = "";
              const instance = M.Modal.getInstance(signupModal);
              instance.close();
            
              window.location.href = type === "user" ? "/pages/home.html" : "/pages/driver.html";
            })
            .catch((error) => {
              signupFormError.innerHTML = `<blockquote><strong>${error.message}</strong></blockquote>`;
            });
        }
      })
      .catch(function (error) {
        console.log("Error getting documents: ", error);
        signupFormError.innerHTML = `<blockquote><strong>Something went wrong. Please Try again later.</strong></blockquote>`;
      });
  });
}
