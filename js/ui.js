document.addEventListener("DOMContentLoaded", () => {
  initAllMaterializeCSS();
});

// * Initialize All Materialize CSS
const initAllMaterializeCSS = (type, element) => {
  const sidenav = document.querySelectorAll(".sidenav");
  const modals = document.querySelectorAll(".modal");
  const floatActButton = document.querySelectorAll(".fixed-action-btn");
  const tooltip = document.querySelectorAll(".tooltipped");
  const collapse = document.querySelectorAll(".collapsible");
  const tapTarget = document.querySelectorAll(".tap-target");
  const select = document.querySelectorAll("select");
  const materialBox = document.querySelectorAll(".materialboxed");
  const dropdown = document.querySelectorAll(".dropdown-trigger");
  const tabs = document.querySelectorAll(".tabs");
  const datePicker = document.querySelectorAll(".datepicker");
  const autocomplete = document.querySelectorAll(".autocomplete");

  if (type === undefined) {
    M.Sidenav.init(sidenav);
    M.Modal.init(modals);
    M.FloatingActionButton.init(floatActButton);
    M.Tooltip.init(tooltip);
    M.Collapsible.init(collapse);
    M.TapTarget.init(tapTarget);
    M.FormSelect.init(select);
    M.Materialbox.init(materialBox);
    M.Dropdown.init(dropdown);
    M.Tabs.init(tabs);
    M.Datepicker.init(datePicker);
    M.Autocomplete.init(autocomplete, {
      data: {
        None: null,
      },
    });
  } else {
    const m = `M.${type}.init(${element})`;

    eval(m);
  }
};

// * Setup Page loading
const setupPageLoading = () => {
  const main = document.querySelectorAll("main");
  const loading = document.querySelectorAll(".loading");

  main.forEach((item) => (item.style.display = "block"));
  loading.forEach((item) => (item.style.display = "none"));
};

// * Setup Menu UI
// const loggedInLinks = document.querySelectorAll(".logged-in");
const setupMenuUI = (user) => {
  if (user) {
    // Account Info
    db.collection("getmoco_users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        const sideNavName = document.querySelectorAll("#sidenav .name");
        const sideNavEmail = document.querySelectorAll("#sidenav .email");
        const fname = doc.data().fname;
        const lname = doc.data().lname;
        sideNavName.forEach((item) => (item.textContent = `${fname} ${lname}`));
        sideNavEmail.forEach((item) => (item.textContent = user.email));
      })
      .then(() => {
        db.collection("getmoco_uploads")
          .where("uploadedBy", "==", user.uid)
          .where("description", "==", "profile")
          .get()
          .then((snapshot) => {
            if (!snapshot.empty) {
              snapshot.forEach((doc) => {
                const docImage = doc.data().url;

                const userImage = document.querySelectorAll(
                  "#sidenav .user-image"
                );

                userImage.forEach((item) => (item.src = docImage));
              });
            } else {
              const userImage = document.querySelectorAll(
                "#sidenav .user-image"
              );

              userImage.forEach((item) => (item.src = "/img/default-user.jpg"));
            }
          });
      })
      .catch((err) => {
        console.log(err);
      });

    // loggedInLinks.forEach((item) => (item.style.display = "block"));
  } else {
    // loggedInLinks.forEach((item) => (item.style.display = "none"));
  }
};

// * Reset Report Form
const resetReportForm = () => {
  const reportModal = document.querySelector("#report_modal");
  const reportForm = reportModal.querySelector("#report_form");
  const reportDetailsField = reportForm.querySelector("#report");
  const reportButton = reportForm.querySelector(".report-button");
  const errorField = reportForm.querySelector(".error");

  reportDetailsField.disabled = false;
  reportButton.disabled = false;
  errorField.innerHTML = "";
  reportForm.reset();
};

// * Render Warning Message
const renderWarningMessage = (data, dataID, customerID, type) => {
  const alertModal = document.querySelector("#alert_modal");
  const title = alertModal.querySelector(".card-title");
  const details = alertModal.querySelector(".details");
  const button = alertModal.querySelector("#alert_button");

  const instance = M.Modal.getInstance(alertModal).open();
  instance.options.dismissible = false;

  title.innerHTML = `<strong>${data.title}</strong>`;

  button.className = "btn btn-small teal okay";
  button.innerHTML = "Okay, I Understand.";

  button.setAttribute("data-id", dataID);

  details.innerHTML = data.details;

  button.addEventListener("click", (e) => {
    if (e.target.className === "btn btn-small teal okay") {
      const notifID = e.target.getAttribute("data-id");

      if (type === "warning") {
        db.collection("getmoco_notifications")
          .doc(notifID)
          .update({
            status: "seen",
            seen: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            instance.close();
          });
      } else if (type === "inactive") {
        db.collection("getmoco_users").doc(customerID).update({
          status: "active",
          inactive: "",
          disabled: "",
        });
        db.collection("getmoco_notifications")
          .doc(notifID)
          .delete()
          .then(() => {
            instance.close();
          });
      }
    }
  });
};

// * Render Disable Message
const renderDisableMessage = (userID) => {
  const alertModal = document.querySelector("#alert_modal");
  const title = alertModal.querySelector(".card-title");
  const details = alertModal.querySelector(".details");
  const button = alertModal.querySelector("#alert_button");

  const instance = M.Modal.getInstance(alertModal).open();
  instance.options.dismissible = false;

  title.innerHTML = "<strong>Account Disabled</strong>";

  button.className = "btn btn-small red logout";
  button.innerHTML = "Logout";

  db.collection("getmoco_notifications")
    .where("userID", "==", userID)
    .where("type", "==", "disable")
    .get()
    .then((snap) => {
      if (!snap.empty) {
        snap.forEach((doc) => {
          details.innerHTML = doc.data().details;
        });
      }
    });
};

/**
 ** ****************************************************************************
 **
 ** a_orders.html
 **
 ** ****************************************************************************
 */

// * Render All Orders
const renderAllOrders = (data, dataID, dateType) => {
  const filterOrders = document.querySelector(".filter-orders select");
  const dateForm = document.querySelector("#date-form");
  const dayWeekContainer = dateForm.querySelector(".day-week-container");
  const monthContainer = dateForm.querySelector(".month-container");
  const customContainer = dateForm.querySelector(".custom-container");

  const selectVal = filterOrders.value;

  if (selectVal === "all") {
    dayWeekContainer.style.display = "none";
    monthContainer.style.display = "none";
    customContainer.style.display = "none";

    renderEachOrders(data, dataID, dateType);
  } else if (selectVal === "day") {
    dayWeekContainer.style.display = "block";
    monthContainer.style.display = "none";
    customContainer.style.display = "none";

    const dataDate = `data.${dateType}`;
    const date = eval(dataDate).toDate().toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

    const day =
      dateForm.day.value !== ""
        ? new Date(dateForm.day.value).toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          })
        : "";

    // console.log(day, date);
    if (day !== "" && day === date) {
      renderEachOrders(data, dataID, dateType);
    } else {
      // i--;
      // j--;
      // k--;
      // m--;
      // n--;
    }
  } else if (selectVal === "week") {
    dayWeekContainer.style.display = "block";
    monthContainer.style.display = "none";
    customContainer.style.display = "none";

    const dataDate = `data.${dateType}`;
    const date = eval(dataDate).toDate().toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

    const day = dateForm.day.value !== "" ? new Date(dateForm.day.value) : "";

    if (day !== "") {
      // console.log(day);

      let week = new Array();

      // Starting Monday not Sunday
      day.setDate(day.getDate() - day.getDay() + 1);

      for (let i = 0; i < 7; i++) {
        week.push(new Date(day));
        day.setDate(day.getDate() + 1);
      }

      // console.log(week);

      week.forEach((day) => {
        const perDay = day.toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        });

        // console.log(perDay, date);

        if (perDay === date) {
          renderEachOrders(data, dataID, dateType);
        }
      });
    }
  } else if (selectVal === "month") {
    dayWeekContainer.style.display = "none";
    monthContainer.style.display = "block";
    customContainer.style.display = "none";

    const dataDate = `data.${dateType}`;
    const date = eval(dataDate).toDate().toLocaleString("en-US", {
      month: "numeric",
      year: "numeric",
    });

    const month =
      dateForm.month.value !== ""
        ? new Date(dateForm.month.value).toLocaleString("en-US", {
            month: "numeric",
            year: "numeric",
          })
        : "";

    if (month !== "" && month === date) {
      // console.log(month);
      renderEachOrders(data, dataID, dateType);
    }
  } else if (selectVal === "custom") {
    dayWeekContainer.style.display = "none";
    monthContainer.style.display = "none";
    customContainer.style.display = "block";

    const day1 =
      dateForm.day1.value !== ""
        ? new Date(dateForm.day1.value).toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          })
        : "";

    const day2 =
      dateForm.day2.value !== ""
        ? new Date(dateForm.day2.value).toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          })
        : "";

    if (day1 !== "" && day2 !== "") {
      // console.log(month);

      let daylist = getDaysArray(day1, day2);
      daylist.map((v) => v.toISOString().slice(0, 10)).join("");

      // console.log(daylist);

      const dataDate = `data.${dateType}`;
      const date = eval(dataDate).toDate().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });

      daylist.forEach((day) => {
        const perDay = day.toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        });

        // console.log(day1, day2);
        // console.log(perDay, date);

        const day1Time = new Date(dateForm.day1.value).toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        });
        const day2Time = new Date(dateForm.day2.value).toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        });
        const dataDate = `data.${dateType}`;
        const dateTime = eval(dataDate).toDate().toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        });

        if (
          perDay === day1 &&
          perDay === day2 &&
          date === day1 &&
          date === day2
        ) {
          // console.log(day1Time, dateTime, day2Time);
          if (dateTime >= day1Time && dateTime <= day2Time) {
            renderEachOrders(data, dataID, dateType);
          } else {
            // i--;
            // j--;
            // k--;
            // m--;
            // n--;
          }
        } else if (perDay === day1 && date === day1) {
          if (dateTime >= day1Time) {
            renderEachOrders(data, dataID, dateType);
          } else {
            // i--;
            // j--;
            // k--;
            // m--;
            // n--;
          }
        } else if (perDay === day2 && date === day2) {
          if (dateTime <= day2Time) {
            renderEachOrders(data, dataID, dateType);
          }
        } else if (perDay === date) {
          renderEachOrders(data, dataID, dateType);
        }
      });
    }
  }
};

// * Render Each Orders after choosing option
const renderEachOrders = (data, dataID, dateType) => {
  const totalOrders = document.querySelector(".totalOrders");
  const totalCustomers = document.querySelector(".totalCustomers");
  const totalDrivers = document.querySelector(".totalDrivers");
  const expandButton = document.querySelector(
    "#expand_form input[name='expand']"
  );

  expandButton.disabled = false;

  orderCount++;

  totalOrders.innerHTML = orderCount;

  const expandForm = document.querySelector("#expand_form");

  const checkValue = expandForm.expand.checked; // date expand
  const checkValue2 = expandForm.expand2.checked; // per driver
  // console.log(checkValue);

  i++;
  j++;
  k++;
  m++;
  n++;

  if (!checkValue) {
    expandForm.querySelector(".per-driver").style.display = "none";
    expandForm.expand2.disabled = true;
    expandForm.expand2.checked = false;

    const column3 = document.querySelector(".column3");
    const column4 = document.querySelector(".column4");
    const column5 = document.querySelector(".column5");
    column3.innerHTML = "Orders";
    column4.innerHTML = "Customers";
    column5.innerHTML = "Drivers";

    const dataDate = `data.${dateType}`;
    const date = eval(dataDate).toDate().toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const driverID = data.driverID;
    const customerID = data.customerID;

    drivers[j - 1] = driverID;
    customers[k - 1] = customerID;
    drivers2[m - 1] = driverID;
    customers2[n - 1] = customerID;
    // console.log("drivers", drivers);
    // console.log("customers", customers);

    let newDrivers = [...new Set(drivers)];
    let newCustomers = [...new Set(customers)];
    let newDrivers2 = [...new Set(drivers2)];
    let newCustomers2 = [...new Set(customers2)];
    // console.log("newDrivers", newDrivers);
    // console.log("newCustomers", newCustomers);

    driverCount = newDrivers2[0] !== "" ? newDrivers2.length : 0;
    customerCount = newCustomers2[0] !== "" ? newCustomers2.length : 0;

    totalDrivers.innerHTML =
      newDrivers[0] !== "" && newDrivers[newDrivers.length - 1] !== ""
        ? newDrivers.length
        : 0;
    totalCustomers.innerHTML =
      newCustomers[0] !== "" && newCustomers[newCustomers.length - 1]
        ? newCustomers.length
        : 0;

    // let countCount = i;
    let countOrders = 1;
    let countCustomers = customerCount;
    let countDrivers = driverCount;

    // console.log("countCustomers", countCustomers);
    // console.log("countDrivers", countDrivers);

    const checkRow = document.querySelector(
      `.order[data-id="${date.replace(/[^a-zA-Z0-9]/g, "")}"]`
    );
    if (checkRow) {
      const modOrders = checkRow.querySelector(".modOrders").innerHTML;

      i--;
      countOrders = parseInt(modOrders) + 1;

      checkRow.remove();
    } else {
      if (i !== 1) {
        m = 1;
        n = 1;

        drivers2 = [];
        customers2 = [];
        newDrivers2 = [];
        newCustomers2 = [];

        drivers2[m - 1] = driverID;
        customers2[n - 1] = customerID;
        // console.log("drivers2", drivers2);
        // console.log("customers2", customers2);

        newDrivers2 = [...new Set(drivers2)];
        newCustomers2 = [...new Set(customers2)];
        // console.log("newDrivers2", newDrivers2);
        // console.log("newCustomers2", newCustomers2);

        countDrivers =
          newDrivers2[0] !== "" && newDrivers2[newDrivers2.length - 1] !== ""
            ? newDrivers2.length
            : 0;
        countCustomers =
          newCustomers2[0] !== "" && newCustomers2[newCustomers2.length - 1]
            ? newCustomers2.length
            : 0;
      }
    }

    const html = `
      <tr 
        class="order"
        data-id="${date.replace(/[^a-zA-Z0-9]/g, "")}" 
      >
        <td class="modCount">
          ${i}
        </td>
        <td class="modDate">
          ${date}
        </td>
        <td class="modOrders">
          ${countOrders}
        </td>
        <td class="modCustomer" data-id="${data.customerID}">
          ${countCustomers}
        </td>
        <td class="modDriver" data-id="${data.driverID}">
          ${countDrivers}
        </td>
      </tr>
    `;

    const tableBody = document.querySelector(".table-body");

    tableBody.innerHTML += html;
  } else if (checkValue && !checkValue2) {
    //expandForm.querySelector(".per-driver").style.display = "block";
    expandForm.expand2.disabled = false;

    const column3 = document.querySelector(".column3");
    const column4 = document.querySelector(".column4");
    const column5 = document.querySelector(".column5");
    column3.innerHTML = "Order";
    column4.innerHTML = "Customer";
    column5.innerHTML = "Driver";

    const dataDate = `data.${dateType}`;
    const date = eval(dataDate).toDate().toLocaleString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });

    const driverID = data.driverID;
    const customerID = data.customerID;

    drivers[i - 1] = driverID;
    customers[i - 1] = customerID;
    // console.log("drivers", drivers);
    // console.log("customers", customers);

    let newDrivers = [...new Set(drivers)];
    let newCustomers = [...new Set(customers)];
    // console.log("newDrivers", newDrivers);
    // console.log("newCustomers", newCustomers);

    driverCount = newDrivers[0] !== "" ? newDrivers.length : 0;
    customerCount = newCustomers[0] !== "" ? newCustomers.length : 0;

    totalDrivers.innerHTML = driverCount;
    totalCustomers.innerHTML = customerCount;

    const html = `
      <tr 
        class="order modal-trigger"
        data-id="${dataID}"
        href="#view_order_modal"
        style="cursor: pointer;"
      >
        <td class="modCount" data-id="${dataID}">
          ${i}
        </td>
        <td class="modDate" data-id="${dataID}">
          ${date}
        </td>
        <td class="modOrders" data-id="${dataID}">
          ${dataID}
        </td>
        <td class="modCustomer" data-id="${dataID}">
          <em>None</em>
        </td>
        <td class="modDriver" data-id="${dataID}">
          <em>None</em>
        </td>
      </tr>
    `;

    const tableBody = document.querySelector(".table-body");

    tableBody.innerHTML += html;

    db.collection("getmoco_users")
      .get()
      .then((snap) => {
        snap.forEach((doc) => {
          if (doc.id === customerID) {
            const trName = document.querySelector(
              `.order[data-id="${dataID}"] .modCustomer`
            );
            trName.innerHTML = doc.data().lname + ", " + doc.data().fname;
          }

          if (doc.id === driverID) {
            const trName = document.querySelector(
              `.order[data-id="${dataID}"] .modDriver`
            );
            trName.innerHTML = doc.data().lname + ", " + doc.data().fname;
          }
        });
      });
  }
};

/**
 ** ****************************************************************************
 **
 ** a_sales_report.html
 **
 ** ****************************************************************************
 */

// * Render All Sales
const renderAllSales = (data, dataID) => {
  if (data.shipStatus === "completed") {
    const filterOrders = document.querySelector(".filter-orders select");
    const dateForm = document.querySelector("#date-form");
    const dayWeekContainer = dateForm.querySelector(".day-week-container");
    const monthContainer = dateForm.querySelector(".month-container");
    const customContainer = dateForm.querySelector(".custom-container");

    const selectVal = filterOrders.value;

    if (selectVal === "all") {
      dayWeekContainer.style.display = "none";
      monthContainer.style.display = "none";
      customContainer.style.display = "none";

      renderEachSales(data, dataID);
    } else if (selectVal === "day") {
      dayWeekContainer.style.display = "block";
      monthContainer.style.display = "none";
      customContainer.style.display = "none";

      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });

      const day =
        dateForm.day.value !== ""
          ? new Date(dateForm.day.value).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })
          : "";

      // console.log(day, date);
      if (day !== "" && day === date) {
        renderEachSales(data, dataID);
      } else {
        i--;
        j--; // for total drivers count
      }
    } else if (selectVal === "week") {
      dayWeekContainer.style.display = "block";
      monthContainer.style.display = "none";
      customContainer.style.display = "none";

      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });

      const day = dateForm.day.value !== "" ? new Date(dateForm.day.value) : "";

      if (day !== "") {
        // console.log(day);

        let week = new Array();

        // Starting Monday not Sunday
        day.setDate(day.getDate() - day.getDay() + 1);

        for (let i = 0; i < 7; i++) {
          week.push(new Date(day));
          day.setDate(day.getDate() + 1);
        }

        // console.log(week);

        week.forEach((day) => {
          const perDay = day.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          });

          // console.log(perDay, date);

          if (perDay === date) {
            renderEachSales(data, dataID);
          }
        });
      }
    } else if (selectVal === "month") {
      dayWeekContainer.style.display = "none";
      monthContainer.style.display = "block";
      customContainer.style.display = "none";

      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "numeric",
        year: "numeric",
      });

      const month =
        dateForm.month.value !== ""
          ? new Date(dateForm.month.value).toLocaleString("en-US", {
              month: "numeric",
              year: "numeric",
            })
          : "";

      if (month !== "" && month === date) {
        // console.log(month);
        renderEachSales(data, dataID);
      }
    } else if (selectVal === "custom") {
      dayWeekContainer.style.display = "none";
      monthContainer.style.display = "none";
      customContainer.style.display = "block";

      const day1 =
        dateForm.day1.value !== ""
          ? new Date(dateForm.day1.value).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })
          : "";

      const day2 =
        dateForm.day2.value !== ""
          ? new Date(dateForm.day2.value).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })
          : "";

      if (day1 !== "" && day2 !== "") {
        // console.log(month);

        let daylist = getDaysArray(day1, day2);
        daylist.map((v) => v.toISOString().slice(0, 10)).join("");

        // console.log(daylist);

        const date = data.delivered.toDate().toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        });

        daylist.forEach((day) => {
          const perDay = day.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          });

          // console.log(day1, day2);
          // console.log(perDay, date);

          const day1Time = new Date(dateForm.day1.value).toLocaleString(
            "en-US",
            {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: false,
            }
          );
          const day2Time = new Date(dateForm.day2.value).toLocaleString(
            "en-US",
            {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: false,
            }
          );
          const dateTime = data.delivered.toDate().toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
          });

          if (
            perDay === day1 &&
            perDay === day2 &&
            date === day1 &&
            date === day2
          ) {
            // console.log(day1Time, dateTime, day2Time);
            if (dateTime >= day1Time && dateTime <= day2Time) {
              renderEachSales(data, dataID);
            } else {
              i--;
              j--; // for total drivers count
            }
          } else if (perDay === day1 && date === day1) {
            if (dateTime >= day1Time) {
              renderEachSales(data, dataID);
            } else {
              i--;
              j--; // for total drivers count
            }
          } else if (perDay === day2 && date === day2) {
            if (dateTime <= day2Time) {
              renderEachSales(data, dataID);
            }
          } else if (perDay === date) {
            renderEachSales(data, dataID);
          }
        });
      }
    }
  }
};
// ? Get Days in Custom Range
const getDaysArray = (start, end) => {
  for (
    var arr = [], dt = new Date(start);
    dt <= new Date(end);
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(new Date(dt));
  }
  return arr;
};

// * Render Each Sales after choosing option
const renderEachSales = (data, dataID) => {
  const totalAppEarnings = document.querySelector(".totalAppEarnings");
  const totalDriverEarnings = document.querySelector(".totalDriverEarnings");
  const totalServiceFees = document.querySelector(".totalServiceFees");
  const totalItemFees = document.querySelector(".totalItemFees");
  const totalOrderFees = document.querySelector(".totalOrderFees");
  const totalOrders = document.querySelector(".totalOrders");
  const downloadButton = document.querySelector(".download-button");
  const expandButton = document.querySelector(
    "#expand_form input[name='expand']"
  );

  let totalItemsPrice = parseFloat(data.totalItemsPrice);
  let itemsPrice = parseFloat(data.itemsPrice);
  let serviceFee = parseFloat(data.serviceFee);
  let driverEarning = parseFloat(data.driverEarning);
  let appEarning = parseFloat(data.appEarning);

  downloadButton.disabled = false;
  expandButton.disabled = false;

  allAppEarnings += appEarning;
  allDriverEarnings += driverEarning;
  allServiceFees += serviceFee;
  allItemFees += itemsPrice;
  allOrderFees += totalItemsPrice;
  orderCount++;

  totalAppEarnings.innerHTML = allAppEarnings.toFixed(2);
  totalDriverEarnings.innerHTML = allDriverEarnings.toFixed(2);
  totalServiceFees.innerHTML = allServiceFees.toFixed(2);
  totalItemFees.innerHTML = allItemFees.toFixed(2);
  totalOrderFees.innerHTML = allOrderFees.toFixed(2);
  totalOrders.innerHTML = orderCount;

  const expandForm = document.querySelector("#expand_form");

  const checkValue = expandForm.expand.checked; // date expand
  const checkValue2 = expandForm.expand2.checked; // per driver
  // console.log(checkValue);

  if (!checkValue) {
    expandForm.querySelector(".per-driver").style.display = "none";
    expandForm.expand2.disabled = true;
    expandForm.expand2.checked = false;

    const column2 = document.querySelector(".column2");
    const column3 = document.querySelector(".column3");
    column2.innerHTML = "Date";
    column3.innerHTML = "Orders";

    const date = data.delivered.toDate().toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const driverID = data.driverID;

    drivers[j - 1] = driverID;
    // console.log("drivers", drivers);

    let newDrivers = [...new Set(drivers)];
    // console.log("newDrivers", newDrivers);

    const totalDrivers = document.querySelector(".totalDrivers");

    driverCount = newDrivers.length;
    totalDrivers.innerHTML = driverCount;

    // let countCount = i;
    let countOrders = 1;

    const checkRow = document.querySelector(
      `.order[data-id="${date.replace(/[^a-zA-Z0-9]/g, "")}"]`
    );
    if (checkRow) {
      // const modCount = checkRow.querySelector(".modCount").innerHTML;
      // const modDate = checkRow.querySelector(".modDate").innerHTML;
      const modOrders = checkRow.querySelector(".modOrders").innerHTML;
      const modTotalFees =
        checkRow.querySelector("span.modTotalFees").innerHTML;
      const modItemFees = checkRow.querySelector("span.modItemFees").innerHTML;
      const modServiceFees = checkRow.querySelector(
        "span.modServiceFees"
      ).innerHTML;
      const modEarnings = checkRow.querySelector("span.modEarnings").innerHTML;
      const modPlatformFee = checkRow.querySelector(
        "span.modPlatformFee"
      ).innerHTML;

      //countCount = parseInt(modCount) - 1;
      i--;
      countOrders = parseInt(modOrders) + 1;
      totalItemsPrice += parseFloat(modTotalFees);
      itemsPrice += parseFloat(modItemFees);
      serviceFee += parseFloat(modServiceFees);
      driverEarning += parseFloat(modEarnings);
      appEarning += parseFloat(modPlatformFee);

      checkRow.remove();
    }

    const html = `
      <tr 
        class="order"
        data-id="${date.replace(/[^a-zA-Z0-9]/g, "")}" 
      >
        <td class="modCount">
          ${i}
        </td>
        <td class="modDate">
          ${date}
        </td>
        <td class="modOrders">
          ${countOrders}
        </td>
        <td class="modTotalFees">
          &#8369; 
          <span class="modTotalFees">
            ${totalItemsPrice.toFixed(2)}
          </span>
        </td>
        <td class="modItemFees">
          &#8369; <span class="modItemFees">${itemsPrice.toFixed(2)}</span>
        </td>
        <td class="modServiceFees">
          &#8369; <span class="modServiceFees">${serviceFee.toFixed(2)}</span>
        </td>
        <td class="modEarnings">
          &#8369; <span class="modEarnings">${driverEarning.toFixed(2)}</span>
        </td>
        <td class="modPlatformFee">
          &#8369; <span class="modPlatformFee">${appEarning.toFixed(2)}</span>
        </td>
      </tr>
    `;

    const tableBody = document.querySelector(".table-body");

    tableBody.innerHTML += html;
  } else if (checkValue && !checkValue2) {
    expandForm.querySelector(".per-driver").style.display = "block";
    expandForm.expand2.disabled = false;

    const column2 = document.querySelector(".column2");
    const column3 = document.querySelector(".column3");
    column2.innerHTML = "Driver";
    column3.innerHTML = "Date";

    const date = data.delivered.toDate().toLocaleString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });

    const driverID = data.driverID;

    drivers[i - 1] = driverID;

    let newDrivers = [...new Set(drivers)];

    const totalDrivers = document.querySelector(".totalDrivers");
    totalDrivers.innerHTML = newDrivers.length;

    const html = `
      <tr 
        class="order modal-trigger"
        data-id="${dataID}"
        href="#view_order_modal"
        style="cursor: pointer;"
      >
        <td class="modCount" data-id="${dataID}">
          ${i}
        </td>
        <td class="modName" data-id="${dataID}">
          ${""}
        </td>
        <td class="modDate" data-id="${dataID}">
          ${date}
        </td>
        <td class="modTotalFees" data-id="${dataID}">
          &#8369; ${totalItemsPrice.toFixed(2)}
        </td>
        <td class="modItemFees" data-id="${dataID}">
          &#8369; ${itemsPrice.toFixed(2)}
        </td>
        <td class="modServiceFees" data-id="${dataID}">
          &#8369; ${serviceFee.toFixed(2)}
        </td>
        <td class="modEarnings" data-id="${dataID}">
          &#8369; ${driverEarning.toFixed(2)}
        </td>
        <td class="modPlatformFee" data-id="${dataID}">
          &#8369; ${appEarning.toFixed(2)}
        </td>
      </tr>
    `;

    const tableBody = document.querySelector(".table-body");

    tableBody.innerHTML += html;

    db.collection("getmoco_users")
      .doc(driverID)
      .get()
      .then((doc) => {
        const trName = document.querySelector(
          `.order[data-id="${dataID}"] .modName`
        );
        trName.innerHTML = doc.data().lname + ", " + doc.data().fname;
      });
  } else if (checkValue && checkValue2) {
    expandForm.querySelector(".per-driver").style.display = "block";
    expandForm.expand2.disabled = false;

    const column2 = document.querySelector(".column2");
    const column3 = document.querySelector(".column3");
    column2.innerHTML = "Driver";
    column3.innerHTML = "Orders";

    const date = data.delivered.toDate().toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const driverID = data.driverID;

    drivers[i - 1] = driverID;

    let newDrivers = [...new Set(drivers)];

    const totalDrivers = document.querySelector(".totalDrivers");
    totalDrivers.innerHTML = newDrivers.length;

    // let countCount = i;
    let countOrders = 1;

    const checkRow = document.querySelector(`.driver[data-id="${driverID}"]`);
    if (checkRow) {
      const modCount = checkRow.querySelector(".modCount").innerHTML;
      const modOrders = checkRow.querySelector(".modOrders");
      const modTotalFees = checkRow.querySelector("span.modTotalFees");
      const modItemFees = checkRow.querySelector("span.modItemFees");
      const modServiceFees = checkRow.querySelector("span.modServiceFees");
      const modEarnings = checkRow.querySelector("span.modEarnings");
      const modPlatformFee = checkRow.querySelector("span.modPlatformFee");

      //countCount = parseInt(modCount) - 1;
      i--;
      countOrders = parseInt(modOrders.innerHTML) + 1;
      totalItemsPrice += parseFloat(modTotalFees.innerHTML);
      itemsPrice += parseFloat(modItemFees.innerHTML);
      serviceFee += parseFloat(modServiceFees.innerHTML);
      driverEarning += parseFloat(modEarnings.innerHTML);
      appEarning += parseFloat(modPlatformFee.innerHTML);

      //checkRow.remove();

      modCount.innerHTML = i;
      modOrders.innerHTML = countOrders;
      modTotalFees.innerHTML = totalItemsPrice.toFixed(2);
      modItemFees.innerHTML = itemsPrice.toFixed(2);
      modServiceFees.innerHTML = serviceFee.toFixed(2);
      modEarnings.innerHTML = driverEarning.toFixed(2);
      modPlatformFee.innerHTML = appEarning.toFixed(2);
    } else {
      const html = `
        <tr 
          class="driver modal-trigger"
          href="#driver_modal"
          data-id="${driverID}"
          style="cursor: pointer;"
        >
          <td class="modCount" data-id="${driverID}">
            ${i}
          </td>
          <td class="modName" data-id="${driverID}">
            ${""}
          </td>
          <td class="modOrders" data-id="${driverID}">
            ${countOrders}
          </td>
          <td class="modTotalFees" data-id="${driverID}">
            &#8369; 
            <span class="modTotalFees" data-id="${driverID}">
              ${totalItemsPrice.toFixed(2)}
            </span>
          </td>
          <td class="modItemFees" data-id="${driverID}">
            &#8369; 
            <span class="modItemFees" data-id="${driverID}">
              ${itemsPrice.toFixed(2)}  </span>
          </td>
          <td class="modServiceFees" data-id="${driverID}">
            &#8369; 
            <span class="modServiceFees" data-id="${driverID}">
              ${serviceFee.toFixed(2)}  </span>
          </td>
          <td class="modEarnings" data-id="${driverID}">
            &#8369; 
            <span class="modEarnings" data-id="${driverID}">
              ${driverEarning.toFixed(2)}  </span>
          </td>
          <td class="modPlatformFee" data-id="${driverID}">
            &#8369; 
            <span class="modPlatformFee" data-id="${driverID}">
              ${appEarning.toFixed(2)}  </span>
          </td>
        </tr>
      `;

      const tableBody = document.querySelector(".table-body");

      tableBody.innerHTML += html;

      db.collection("getmoco_users")
        .doc(driverID)
        .get()
        .then((doc) => {
          const trName = document.querySelector(
            `.driver[data-id="${driverID}"] .modName`
          );
          trName.innerHTML = doc.data().lname + ", " + doc.data().fname;
        });
    }
  }
};

// * Render Driver Sales
const renderDriverSales = (data, dataID) => {
  if (data.shipStatus === "completed") {
    const filterOrders = document.querySelector(".filter-orders select");
    const dateForm = document.querySelector("#date-form");

    const selectVal = filterOrders.value;

    if (selectVal === "all") {
      renderEachDriverSales(data, dataID);
    } else if (selectVal === "day") {
      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });

      const day =
        dateForm.day.value !== ""
          ? new Date(dateForm.day.value).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })
          : "";

      // console.log(day, date);
      if (day !== "" && day === date) {
        renderEachDriverSales(data, dataID);
      } else {
        i--;
      }
    } else if (selectVal === "week") {
      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });

      const day = dateForm.day.value !== "" ? new Date(dateForm.day.value) : "";

      if (day !== "") {
        // console.log(day);

        let week = new Array();

        // Starting Monday not Sunday
        day.setDate(day.getDate() - day.getDay() + 1);

        for (let i = 0; i < 7; i++) {
          week.push(new Date(day));
          day.setDate(day.getDate() + 1);
        }

        // console.log(week);

        week.forEach((day) => {
          const perDay = day.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          });

          // console.log(perDay, date);

          if (perDay === date) {
            renderEachDriverSales(data, dataID);
          }
        });
      }
    } else if (selectVal === "month") {
      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "numeric",
        year: "numeric",
      });

      const month =
        dateForm.month.value !== ""
          ? new Date(dateForm.month.value).toLocaleString("en-US", {
              month: "numeric",
              year: "numeric",
            })
          : "";

      if (month !== "" && month === date) {
        // console.log(month);
        renderEachDriverSales(data, dataID);
      }
    } else if (selectVal === "custom") {
      const day1 =
        dateForm.day1.value !== ""
          ? new Date(dateForm.day1.value).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })
          : "";

      const day2 =
        dateForm.day2.value !== ""
          ? new Date(dateForm.day2.value).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })
          : "";

      if (day1 !== "" && day2 !== "") {
        // console.log(month);

        let daylist = getDaysArray(day1, day2);
        daylist.map((v) => v.toISOString().slice(0, 10)).join("");

        // console.log(daylist);

        const date = data.delivered.toDate().toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        });

        daylist.forEach((day) => {
          const perDay = day.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          });

          // console.log(day1, day2);
          // console.log(perDay, date);

          const day1Time = new Date(dateForm.day1.value).toLocaleString(
            "en-US",
            {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: false,
            }
          );
          const day2Time = new Date(dateForm.day2.value).toLocaleString(
            "en-US",
            {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: false,
            }
          );
          const dateTime = data.delivered.toDate().toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
          });

          if (
            perDay === day1 &&
            perDay === day2 &&
            date === day1 &&
            date === day2
          ) {
            // console.log(day1Time, dateTime, day2Time);
            if (dateTime >= day1Time && dateTime <= day2Time) {
              renderEachDriverSales(data, dataID);
            } else {
              i--;
            }
          } else if (perDay === day1 && date === day1) {
            if (dateTime >= day1Time) {
              renderEachDriverSales(data, dataID);
            } else {
              i--;
            }
          } else if (perDay === day2 && date === day2) {
            if (dateTime <= day2Time) {
              renderEachDriverSales(data, dataID);
            }
          } else if (perDay === date) {
            renderEachDriverSales(data, dataID);
          }
        });
      }
    }
  }
};

// * Render Each Driver Sales
const renderEachDriverSales = (data, dataID) => {
  if (data.driverID === currentDriverModalID) {
    const expandForm2 = document.querySelector("#expand_form2");

    let totalItemsPrice = parseFloat(data.totalItemsPrice);
    let itemsPrice = parseFloat(data.itemsPrice);
    let serviceFee = parseFloat(data.serviceFee);
    let driverEarning = parseFloat(data.driverEarning);
    let appEarning = parseFloat(data.appEarning);

    const checkValue = expandForm2.expand.checked; // date expand

    if (!checkValue) {
      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      // let countCount = i;
      let countOrders = 1;

      const checkRow = document.querySelector(
        `.order2[data-id="${date.replace(/[^a-zA-Z0-9]/g, "")}"]`
      );
      if (checkRow) {
        // const modCount = checkRow.querySelector(".modCount").innerHTML;
        // const modDate = checkRow.querySelector(".modDate").innerHTML;
        const modOrders = checkRow.querySelector(".modOrders").innerHTML;
        const modTotalFees =
          checkRow.querySelector("span.modTotalFees").innerHTML;
        const modItemFees =
          checkRow.querySelector("span.modItemFees").innerHTML;
        const modServiceFees = checkRow.querySelector(
          "span.modServiceFees"
        ).innerHTML;
        const modEarnings =
          checkRow.querySelector("span.modEarnings").innerHTML;
        const modPlatformFee = checkRow.querySelector(
          "span.modPlatformFee"
        ).innerHTML;

        //countCount = parseInt(modCount) - 1;
        i--;
        countOrders = parseInt(modOrders) + 1;
        totalItemsPrice += parseFloat(modTotalFees);
        itemsPrice += parseFloat(modItemFees);
        serviceFee += parseFloat(modServiceFees);
        driverEarning += parseFloat(modEarnings);
        appEarning += parseFloat(modPlatformFee);

        checkRow.remove();
      }

      const html = `
        <tr 
          class="order2"
          data-id="${date.replace(/[^a-zA-Z0-9]/g, "")}" 
        >
          <td class="modCount">
            ${i}
          </td>
          <td class="modDate">
            ${date}
          </td>
          <td class="modOrders">
            ${countOrders}
          </td>
          <td class="modTotalFees">
            &#8369; 
            <span class="modTotalFees">
              ${totalItemsPrice.toFixed(2)}
            </span>
          </td>
          <td class="modItemFees">
            &#8369; <span class="modItemFees">${itemsPrice.toFixed(2)}</span>
          </td>
          <td class="modServiceFees">
            &#8369; <span class="modServiceFees">${serviceFee.toFixed(2)}</span>
          </td>
          <td class="modEarnings">
            &#8369; <span class="modEarnings">${driverEarning.toFixed(2)}</span>
          </td>
          <td class="modPlatformFee">
            &#8369; <span class="modPlatformFee">${appEarning.toFixed(2)}</span>
          </td>
        </tr>
      `;

      const tableBody2 = document.querySelector(".table-body2");

      tableBody2.innerHTML += html;
    } else {
      const date = data.delivered.toDate().toLocaleString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });

      let countOrders = 1;

      const html = `
        <tr 
          class="order2 modal-trigger"
          data-id="${dataID}" 
          href="#view_order_modal"
          style="cursor: pointer;"
        >
          <td class="modCount" data-id="${dataID}"> 
            ${i}
          </td>
          <td class="modDate" data-id="${dataID}"> 
            ${date}
          </td>
          <td class="modOrders" data-id="${dataID}"> 
            ${countOrders}
          </td>
          <td class="modTotalFees" data-id="${dataID}"> 
            &#8369; ${totalItemsPrice.toFixed(2)}
          </td>
          <td class="modItemFees" data-id="${dataID}"> 
            &#8369; ${itemsPrice.toFixed(2)}
          </td>
          <td class="modServiceFees" data-id="${dataID}"> 
            &#8369; ${serviceFee.toFixed(2)}
          </td>
          <td class="modEarnings" data-id="${dataID}"> 
            &#8369; ${driverEarning.toFixed(2)}
          </td>
          <td class="modPlatformFee" data-id="${dataID}"> 
            &#8369; ${appEarning.toFixed(2)}
          </td>
        </tr>
      `;

      const tableBody2 = document.querySelector(".table-body2");

      tableBody2.innerHTML += html;
    }
  } else {
    i--;
  }
};

// * Add Total Sales at Top of Table
const addTotalSalesAtTop = (type) => {
  if (type === "show") {
    const tableMain = document.querySelector(".table-main");
    const totalOrders = document.querySelector(".totalOrders");
    const totalDrivers = document.querySelector(".totalDrivers");
    const totalAppEarnings = document.querySelector(".totalAppEarnings");
    const totalDriverEarnings = document.querySelector(".totalDriverEarnings");
    const totalServiceFees = document.querySelector(".totalServiceFees");
    const totalItemFees = document.querySelector(".totalItemFees");
    const totalOrderFees = document.querySelector(".totalOrderFees");

    const html = `
      <thead class="table-head total">
        <tr>
          <th>#</th>
          <th>Total Drivers</th>
          <th>Total Orders</th>
          <th>Total Order Fees</th>
          <th>Total Item Fees</th>
          <th>Total Service Fees</th>
          <th>Total Driver Earnings</th>
          <th>Total App Earnings</th>
        </tr>
      </thead>
      <tbody class="table-body total">
        <tr>
          <td>Total</td>
          <td>${totalDrivers.innerHTML}</td>
          <td>${totalOrders.innerHTML}</td>
          <td>&#8369; ${totalOrderFees.innerHTML}</td>
          <td>&#8369; ${totalItemFees.innerHTML}</td>
          <td>&#8369; ${totalServiceFees.innerHTML}</td>
          <td>&#8369; ${totalDriverEarnings.innerHTML}</td>
          <td>&#8369; ${totalAppEarnings.innerHTML}</td>
        </tr>
      </tbody>
    `;

    const tempHtml = tableMain.innerHTML;
    tableMain.innerHTML = html + tempHtml;

    const driverModal = document.querySelector("#driver_modal");
    const tableMain2 = driverModal.querySelector(".table-main2");
    const modName = driverModal.querySelector(".modName");
    const modOrders = driverModal.querySelector(".modOrders");
    const modTotalFees = driverModal.querySelector(".modTotalFees");
    const modItemFees = driverModal.querySelector(".modItemFees");
    const modServiceFees = driverModal.querySelector(".modServiceFees");
    const modEarnings = driverModal.querySelector(".modEarnings");
    const modPlatformFee = driverModal.querySelector(".modPlatformFee");

    const html2 = `
      <thead class="table-head2 total2">
        <tr>
          <th>#</th>
          <th>Driver</th>
          <th>Total Orders</th>
          <th>Total Order Fees</th>
          <th>Total Item Fees</th>
          <th>Total Service Fees</th>
          <th>Total Driver Earnings</th>
          <th>Total App Earnings</th>
        </tr>
      </thead>
      <tbody class="table-body2 total2">
        <tr>
          <td>Total</td>
          <td>${modName.innerHTML}</td>
          <td>${modOrders.innerHTML}</td>
          <td>${modTotalFees.innerHTML}</td>
          <td>${modItemFees.innerHTML}</td>
          <td>${modServiceFees.innerHTML}</td>
          <td>${modEarnings.innerHTML}</td>
          <td>${modPlatformFee.innerHTML}</td>
        </tr>
      </tbody>
    `;

    const tempHtml2 = tableMain2.innerHTML;
    tableMain2.innerHTML = html2 + tempHtml2;
  } else {
    const tableHeadTotal = document.querySelector(".table-head.total");
    const tableBodyTotal = document.querySelector(".table-body.total");
    tableHeadTotal.remove();
    tableBodyTotal.remove();

    const tableHeadTotal2 = document.querySelector(".table-head2.total2");
    const tableBodyTotal2 = document.querySelector(".table-body2.total2");
    tableHeadTotal2.remove();
    tableBodyTotal2.remove();

    // recall after export close
    setupViewDriverModal();
    setupViewOrderInfo();
  }
};

/**
 ** ****************************************************************************
 **
 ** d_sales_report.html
 **
 ** ****************************************************************************
 */

// * Render Order Sales
const renderOrderSales = (data, dataID, earnings, fee, count) => {
  if (data.shipStatus === "completed" && data.driverID === driverID) {
    const filterOrders = document.querySelector(".filter-orders select");
    const dateForm = document.querySelector("#date-form");
    const dayWeekContainer = dateForm.querySelector(".day-week-container");
    const monthContainer = dateForm.querySelector(".month-container");
    const customContainer = dateForm.querySelector(".custom-container");

    const selectVal = filterOrders.value;

    if (selectVal === "all") {
      dayWeekContainer.style.display = "none";
      monthContainer.style.display = "none";
      customContainer.style.display = "none";

      renderSales(data, dataID, earnings, fee, count);
    } else if (selectVal === "day") {
      dayWeekContainer.style.display = "block";
      monthContainer.style.display = "none";
      customContainer.style.display = "none";

      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });

      const day =
        dateForm.day.value !== ""
          ? new Date(dateForm.day.value).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })
          : "";

      // console.log(day, date);
      if (day !== "" && day === date) {
        renderSales(data, dataID, earnings, fee, count);
      }
    } else if (selectVal === "week") {
      dayWeekContainer.style.display = "block";
      monthContainer.style.display = "none";
      customContainer.style.display = "none";

      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });

      const day = dateForm.day.value !== "" ? new Date(dateForm.day.value) : "";

      if (day !== "") {
        // console.log(day);

        let week = new Array();

        // Starting Monday not Sunday
        day.setDate(day.getDate() - day.getDay() + 1);

        for (let i = 0; i < 7; i++) {
          week.push(new Date(day));
          day.setDate(day.getDate() + 1);
        }

        // console.log(week);

        week.forEach((day) => {
          const perDay = day.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          });

          // console.log(perDay, date);

          if (perDay === date) {
            renderSales(data, dataID, earnings, fee, count);
          }
        });
      }
    } else if (selectVal === "month") {
      dayWeekContainer.style.display = "none";
      monthContainer.style.display = "block";
      customContainer.style.display = "none";

      const date = data.delivered.toDate().toLocaleString("en-US", {
        month: "numeric",
        year: "numeric",
      });

      const month =
        dateForm.month.value !== ""
          ? new Date(dateForm.month.value).toLocaleString("en-US", {
              month: "numeric",
              year: "numeric",
            })
          : "";

      if (month !== "" && month === date) {
        // console.log(month);

        renderSales(data, dataID, earnings, fee, count);
      }
    } else if (selectVal === "custom") {
      dayWeekContainer.style.display = "none";
      monthContainer.style.display = "none";
      customContainer.style.display = "block";

      const day1 =
        dateForm.day1.value !== ""
          ? new Date(dateForm.day1.value).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })
          : "";

      const day2 =
        dateForm.day2.value !== ""
          ? new Date(dateForm.day2.value).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })
          : "";

      if (day1 !== "" && day2 !== "") {
        // console.log(month);

        let daylist = getDaysArray(day1, day2);
        daylist.map((v) => v.toISOString().slice(0, 10)).join("");

        // console.log(daylist);

        const date = data.delivered.toDate().toLocaleString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        });

        daylist.forEach((day) => {
          const perDay = day.toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          });

          // console.log(perDay, date);

          if (perDay === date) {
            renderSales(data, dataID, earnings, fee, count);
          }
        });
      }
    }
  }
};

// * Render Sales after choosing option
const renderSales = (data, dataID, earnings, fee, count) => {
  const totalEarnings = document.querySelector(".totalEarnings");
  const totalFee = document.querySelector(".totalFee");
  const totalOrders = document.querySelector(".totalOrders");

  const listResult = document.querySelector(".list-result");

  const date = data.delivered.toDate().toLocaleString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const driverEarning = parseFloat(data.driverEarning);
  const appEarning = parseFloat(data.appEarning);

  earnings += driverEarning;
  fee += appEarning;
  count++;

  totalEarnings.innerHTML = earnings.toFixed(2);
  totalFee.innerHTML = fee.toFixed(2);
  totalOrders.innerHTML = count;

  const html = `
        <a class="collection-item avatar order black-text modal-trigger" href="#view_order_modal" data-id="${dataID}">
          <i class="material-icons circle" data-id="${dataID}">shopping_cart</i>
          <p data-id="${dataID}">
            Service Fee: 
            <span class="serviceFee orange-text" data-id="${dataID}">
              &#8369; ${data.serviceFee}
            </span>
          </p>
          <p data-id="${dataID}">
            Earnings: 
            <span class="driverEarning teal-text" data-id="${dataID}">
              &#8369; ${data.driverEarning} 
            </span>
          </p>
          <p data-id="${dataID}">
            Platform Fee: 
            <span class="fee red-text" data-id="${dataID}">
              &#8369; ${data.appEarning} 
            </span>
          </p>
          <p data-id="${dataID}">
            <span class="date" data-id="${dataID}">
              Date: 
              <span class="green-text" data-id="${dataID}">${date}</span>
            </span>
          </p>
        </a>
      `;

  const tempHtml = listResult.innerHTML;
  listResult.innerHTML = html + tempHtml;
};

/**
 ** ****************************************************************************
 **
 ** a_settings.html
 **
 ** ****************************************************************************
 */

// * Render Matrix Info
const renderMatrixInfo = (data, dataID) => {
  const settingsContainer = document.querySelector(".settings");
  const location = settingsContainer.querySelector(".location");
  const platformFee = settingsContainer.querySelector(".platformFee");
  const priceLimit = settingsContainer.querySelector(".priceLimit");
  const priceMatrix = settingsContainer.querySelector(".priceMatrix");
  const priorityFee = settingsContainer.querySelector(".priorityFee");

  const editMatrixModal = document.querySelector("#edit-matrix-modal");
  const editMatrixForm = editMatrixModal.querySelector("#edit-matrix-form");

  editMatrixForm.reset();
  editMatrixForm
    .querySelectorAll("label")
    .forEach((item) => (item.className = "active"));

  const dataLoc =
    data.city !== "" && data.province !== ""
      ? data.city + ", " + data.province
      : "<em>None</em>";

  location.innerHTML = dataLoc;
  platformFee.innerHTML = parseFloat(data.platformFee) * 100;
  priceLimit.innerHTML = parseFloat(data.priceLimit).toFixed(2);
  priceMatrix.innerHTML = parseFloat(data.priceMatrix).toFixed(2);
  priorityFee.innerHTML = parseFloat(data.priorityFee).toFixed(2);

  editMatrixForm.province.value = data.province;
  editMatrixForm.city.value = data.city;
  editMatrixForm.platformFee.value = parseFloat(data.platformFee) * 100;
  editMatrixForm.priceLimit.value = parseFloat(data.priceLimit);
  editMatrixForm.priceMatrix.value = parseFloat(data.priceMatrix);
  editMatrixForm.priorityFee.value = parseFloat(data.priorityFee);
};

/**
 ** ****************************************************************************
 **
 ** a_users.html
 **
 ** ****************************************************************************
 */

// * Render User Status
// ? Tab Status
const renderUserStatus = (data, dataID) => {
  const tabStatus = document.querySelector("#tab-status");
  const errorReq = tabStatus.querySelector(".error-req");
  const disable = tabStatus.querySelector(".disable");
  const inactive = tabStatus.querySelector(".inactive");
  const active = tabStatus.querySelector(".active");

  const disableSince = disable.querySelector(".date");
  const inactiveSince = inactive.querySelector(".date");

  const tableBody = document.querySelector(".table-body");
  const perUser = tableBody.querySelector(`.user[data-id="${userID}"]`);
  const perUserStatus = perUser.querySelector(".status");
  const perUserStatusText = perUserStatus.querySelector("span");

  const userStatus = data.status;

  if (userStatus === "disabled") {
    disable.style.display = "block";
    inactive.style.display = "none";
    active.style.display = "none";
    errorReq.style.display = "none";

    perUserStatusText.className = "red-text";
    perUserStatusText.innerHTML = "Disabled";

    const disableDate =
      data.disabled === ""
        ? data.disabled
        : data.disabled !== null
        ? data.disabled.toDate().toLocaleString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          })
        : new Date().toLocaleString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          });

    disableSince.innerHTML = disableDate;
  } else if (userStatus === "inactive") {
    disable.style.display = "none";
    inactive.style.display = "block";
    active.style.display = "none";
    errorReq.style.display = "none";

    perUserStatusText.className = "orange-text";
    perUserStatusText.innerHTML = "Inactive";

    const inactiveDate =
      data.inactive === ""
        ? data.inactive
        : data.inactive !== null
        ? data.inactive.toDate().toLocaleString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          })
        : new Date().toLocaleString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          });

    inactiveSince.innerHTML = inactiveDate;
  } else if (userStatus === "active") {
    disable.style.display = "none";
    inactive.style.display = "none";
    active.style.display = "block";
    errorReq.style.display = "none";

    perUserStatusText.className = "green-text";
    perUserStatusText.innerHTML = "Active";
  } else {
    disable.style.display = "none";
    inactive.style.display = "none";
    active.style.display = "none";
    errorReq.style.display = "block";
  }
};

// * Render User Verification
// ? Tab Verification
const renderUserVerification = (data, dataID) => {
  const tabVerify = document.querySelector("#tab-verification");
  const errorReq = tabVerify.querySelector(".error-req");
  const verified = tabVerify.querySelector(".verified");
  const unverified = tabVerify.querySelector(".unverified");
  const toVerify = tabVerify.querySelector(".toVerify");

  const verifyStatus = data.verified;

  const tableBody = document.querySelector(".table-body");
  const perUser = tableBody.querySelector(`.user[data-id="${userID}"]`);
  const perUserVerify = perUser.querySelector(".verification");
  const perUserVerifyText = perUserVerify.querySelector("span");

  if (verifyStatus === "toVerify") {
    perUserVerifyText.className = "orange-text";
    perUserVerifyText.innerHTML = "To Verify";

    errorReq.style.display = "none";
    verified.style.display = "none";
    unverified.style.display = "none";
    toVerify.style.display = "block";

    db.collection("getmoco_uploads")
      .where("uploadedBy", "==", userID)
      .where("description", "==", "verify")
      .get()
      .then((snap) => {
        if (!snap.empty) {
          snap.forEach((doc) => {
            const verifyImageURL = doc.data().url;

            const verifyImage = toVerify.querySelector("#verify-image2");

            verifyImage.src = verifyImageURL;
          });
        }
      });
  } else if (verifyStatus === "verified") {
    perUserVerifyText.className = "green-text";
    perUserVerifyText.innerHTML = "Verified";

    errorReq.style.display = "none";
    verified.style.display = "block";
    unverified.style.display = "none";
    toVerify.style.display = "none";

    db.collection("getmoco_uploads")
      .where("uploadedBy", "==", userID)
      .where("description", "==", "verify")
      .get()
      .then((snap) => {
        if (!snap.empty) {
          snap.forEach((doc) => {
            const verifyImageURL = doc.data().url;

            const verifyImage = verified.querySelector("#verify-image");

            verifyImage.src = verifyImageURL;
          });
        }
      });
  } else if (verifyStatus === "unverified") {
    perUserVerifyText.className = "red-text";
    perUserVerifyText.innerHTML = "Unverified";

    errorReq.style.display = "none";
    verified.style.display = "none";
    unverified.style.display = "block";
    toVerify.style.display = "none";
  } else {
    perUserVerifyText.className = "black-text";
    perUserVerifyText.innerHTML = "undefined";

    errorReq.style.display = "block";
    verified.style.display = "none";
    unverified.style.display = "none";
    toVerify.style.display = "none";
  }
};

// * Render User Reports List
// ? Tab Report
const renderUserReportsList = (data, dataID, count, type) => {
  const listResult = document.querySelector("#tab-reports .list-reports");

  const date = data.created.toDate().toLocaleString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  let name;
  let userImage;
  let userTypeID =
    type === "reportedUser" ? data.reportedBy : data.reportedUser;

  db.collection("getmoco_users")
    .doc(userTypeID)
    .get()
    .then((doc) => {
      name = `${doc.data().fname} ${doc.data().lname}`;
    });
  db.collection("getmoco_uploads")
    .where("uploadedBy", "==", userTypeID)
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
      const html = `
        <li 
          class="report ${dataID === reportID ? "active" : ""}"
          data-id="${dataID}"
        >
          <div class="collapsible-header">
            <i class="material-icons">report</i>
            <strong>
              <span class="date">
                ${date}
              </span>
            </strong>
            <span class="badge">${count}</span>
          </div>
          <div 
            class="collapsible-body grey lighten-2" 
            ${dataID === reportID ? 'style="display: block"' : ""}
          >
            <h6>
            ${
              // Alternate for Submitted or Received
              type === "reportedUser" ? "Reported By:" : "Reported User:"
            }
            </h6>
            <br>
            <div class="row">
              <div class="col s12 center-align">
                <div class="col s6 push-s3 m2 push-m5">
                  <img
                    class="circle responsive-img user-image materialboxed"
                    src="${userImage}"
                  />
                  </div>
                </div>
                <div class="col s12 center-align">
                  <h6 class="name">${name}</h6>
                  <p>
                    <small class="user-type-label">
                      ${
                        data.reportUserType === "user"
                          ? "Customer ID:"
                          : "Driver ID:"
                      }
                    </small>
                    <small class="user-id">
                      ${
                        type === "reportedUser"
                          ? data.reportedBy
                          : data.reportedUser
                      }
                    </small>
                  </p>
                </div>
                <div class="col s12"><br></div>
                <div class="col s12">
                  <h6>Report Details:</h6>
                  <p class="details">${data.details}</p>
                  <br>
                  <h6>Report Page Source:</h6>
                  <p class="page">${data.page}</p>
                  <h6>Order ID:</h6>
                  <p><small class="orderID">${data.orderID}</small></p>
                  <h6>Active Location ID:</h6>
                  <p><small class="locationID">${data.locationID}</small></p>
                </div>
                <div class="col s12 center-align" data-id="${dataID}">
                  <br>
                  <button 
                    class="waves-effect waves-light btn teal punish-button modal-trigger"
                    href="#punish_user_modal"
                  >
                    Manage Report
                  </button>
                </div>
            </div>
        </li>
      `;

      listResult.innerHTML += html;
    })
    .then(() => {
      initAllMaterializeCSS("Materialbox", "materialBox");
    });
};

// * Render User Orders List
// ? Tab Order
const renderUserOrdersList = (
  data,
  dataID,
  type,
  typeBool,
  count,
  userType
) => {
  // if (data.status === "paid" || data.status === "toPay") {
  const userTypeID =
    userType === "customerID" && data.driverID !== ""
      ? data.driverID
      : userType === "driverID" && data.customerID !== ""
      ? data.customerID
      : "None";

  // console.log("userType", userType);
  // console.log("userTypeID", userTypeID);

  let name;
  let userImage;
  const orderConfirmed = data.orderConfirmed; // upload id

  let ordShipmentStatus = "";
  let ordShipmentTime = "";
  let ordDeliveredTime = "";
  let ordReceivedTime = "";

  let orderItems = [];

  // Order Type Date
  const date =
    type === "toShip"
      ? data.created.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        })
      : !typeBool
      ? data.delivered.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        })
      : data.received.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });

  // Order Status
  const shipment =
    data.shipment === ""
      ? data.shipment
      : data.shipment.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });
  const delivered =
    data.delivered === ""
      ? data.delivered
      : data.delivered.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });
  const received =
    data.received === ""
      ? data.received
      : data.received.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });
  if (
    orderConfirmed === "" &&
    shipment === "" &&
    delivered === "" &&
    received === ""
  ) {
    ordShipmentStatus = "Ongoing"; // In Purchase
    ordShipmentTime = "Ongoing"; // In Purchase
    ordDeliveredTime = "Ongoing"; // In Purchase
    ordReceivedTime = "Ongoing"; // In Purchase
  } else if (
    orderConfirmed !== "" &&
    shipment === "" &&
    delivered === "" &&
    received === ""
  ) {
    ordShipmentStatus = "Ongoing"; // To Ship
    ordShipmentTime = "Ongoing"; // To Ship
    ordDeliveredTime = "Ongoing"; // To Ship
    ordReceivedTime = "Ongoing"; // To Ship
  } else if (
    orderConfirmed !== "" &&
    shipment !== "" &&
    delivered === "" &&
    received === ""
  ) {
    ordShipmentStatus = "Ongoing"; // In Shipment
    ordShipmentTime = shipment;
    ordDeliveredTime = "Ongoing"; // In Shipment
    ordReceivedTime = "Ongoing"; // In Shipment
  } else if (
    orderConfirmed !== "" &&
    shipment !== "" &&
    delivered !== "" &&
    received === ""
  ) {
    ordShipmentStatus = "Delivered";
    ordShipmentTime = shipment;
    ordDeliveredTime = delivered;
    ordReceivedTime = `To Receive`;
  } else {
    ordShipmentStatus = "Completed";
    ordShipmentTime = shipment;
    ordDeliveredTime = delivered;
    ordReceivedTime = received;
  }

  // Receipt
  db.collection("getmoco_users")
    .doc(userTypeID)
    .get()
    .then((doc) => {
      if (doc.exists) {
        name = `${doc.data().fname} ${doc.data().lname}`;
      } else {
        name = "<em>None</em>";
      }
    });
  db.collection("getmoco_uploads")
    .where("uploadedBy", "==", userTypeID)
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
    });
  db.collection("getmoco_items")
    .where("orderID", "==", dataID)
    .where("customerID", "==", data.customerID)
    .get()
    .then((snap) => {
      if (!snap.empty) {
        snap.forEach((doc) => {
          // orderItems.push(doc.data());

          orderItems.push(tabOrderItems(doc.data(), doc.id));
        });
      }
    })
    .then(() => {
      // console.log(orderItems);
      // console.log(orderItems.join(""));

      const listResult = document.querySelector("#tab-orders .list-orders");

      const html = `
        <li class="order" data-id="${dataID}">
          <div class="collapsible-header">
            <i class="material-icons">shopping_cart</i>
            <strong>
              <span class="date">
                ${
                  // type === "toShip"
                  //   ? `orderConfirmed: ${date}`
                  //   : !typeBool
                  //   ? `Delivered: ${date}`
                  //   : `Received: ${date}`
                  date
                }
              </span>
            </strong>
            <span class="badge">${count}</span>
          </div>
          <div class="collapsible-body grey lighten-2">
            <div class="items-list">
              <br />
              <div class="row">
                <div class="col s12 m4 grey lighten-3">
                  <ul class="collapsible">
                    <li class="active">
                      <div class="collapsible-header">
                        <i class="material-icons">location_on</i>
                        Location Details
                      </div>
                      <div class="collapsible-body">
                        <h6><strong>Store Location</strong></h6>
                        <p class="addressOrg">${data.addressOrg}</p>
                        <h6><strong>Store Landmark</strong></h6>
                        <p class="landmarkOrg">
                          ${
                            data.landmarkOrg === ""
                              ? "<em>None</em>"
                              : data.landmarkOrg
                          }
                        </p>
                        <hr>
                        <h6><strong>Delivery Address</strong></h6>
                        <p class="addressDrp">${data.addressDrp}</p>
                        <h6><strong>Delivery Landmark</strong></h6>
                        <p class="landmarkDrp">
                          ${
                            data.landmarkDrp === ""
                              ? "<em>None</em>"
                              : data.landmarkDrp
                          }
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="col s12 m8 teal lighten-3">
                  <ul class="collapsible order-items">
                    ${
                      // join to remove commas (,)(",")
                      orderItems.join("")
                    }
                  </ul>
                </div>
              </div>
            </div>

            <div class="payment-user">
              <div class="row">
                <div class="col s12 m8 grey lighten-2 push-m2">
                  <div class="card">
                    <div class="card-content">
                      <span class="card-title">
                        Order ID:
                      </span>
                      <p class="order-id">${dataID}</p>
                      <div class="row">
                        <div class="col s12 m6">
                        ${` <!--
                          <div class="col s12">
                            <div class="col s12 m6">Total Weight:</div>
                            <div class="col s12 m6">
                              <span class="totalWeight">${"data.totalWeight"}</span> kg
                            </div>
                          </div>
                        --> `}
                          <div class="col s12">
                            <div class="col s12 m6">Total Distance:</div>
                            <div class="col s12 m6">
                              <span class="totalDistance">${
                                data.totalDistance
                              }</span> km
                            </div>
                          </div>
                        </div>
                        <div class="col s12 m6">
                          <div class="col s12">
                            <div class="col s12 m6">Items Price:</div>
                            <div class="col s12 m6">
                              &#8369;&nbsp;<span class="itemsPrice">${
                                data.itemsPrice
                              }</span>
                            </div>
                          </div>
                          <div class="col s12">
                            <div class="col s12 m6">Service Fee:</div>
                            <div class="col s12 m6">
                              &#8369;&nbsp;<span class="serviceFee">${
                                data.serviceFee
                              }</span>
                            </div>
                          </div>
                        </div>
                        <hr class="col s12" />
                        <div class="col s12">
                          <div class="col s6"><strong>Total Price:</strong></div>
                          <div class="col s6">
                            <strong>
                              &#8369;&nbsp;<span class="totalItemsPrice">${
                                data.totalItemsPrice
                              }</span>
                            </strong>
                          </div>
                        </div>
                      </div
                    </div>
                  </div>
                </div>
                <div class="grey lighten-2">
                  <ul class="collapsible">
                    <li class="">
                      <div class="collapsible-header">
                        <i class="material-icons">account_box</i>
                        Getmoco ${
                          userType === "customerID" ? "Driver" : "Customer"
                        }
                      </div>
                      <div class="collapsible-body">
                        <div class="center-align">
                          <div class="col s12 m6 push-m3">
                            <img
                              class="circle responsive-img user-image materialboxed"
                              src="${userImage}"
                            />
                          </div>
                          <div class="col s12">
                            <h6 class="user-name">${name}</h6>
                          </div>
                        </div>
                        <p>
                          <small class="user-type-label">
                          ${
                            userType === "customerID"
                              ? "Driver ID:"
                              : "Customer ID:"
                          }
                          </small>
                          <small class="user-id">${userTypeID}</small>
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="order-status">
              <div class="row">
                <div class="col s12 m8 teal lighten-3 push-m2">
                  <div class="card">
                    <div class="card-content">
                      <span class="card-title">
                        Order Status: 
                      </span>
                      <p class="shipment-status">${ordShipmentStatus}</p>
                      <br>
                      <h6 class="teal-text">Shipment Time:</h6>
                      <p class="shipment">${ordShipmentTime}</p>
                      <h6 class="teal-text">Delivered Time:</h6>
                      <p class="delivered">${ordDeliveredTime}</p>
                      <h6 class="teal-text">Received Time:</h6>
                      <p class="received">${ordReceivedTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      `;

      listResult.innerHTML += html;
    })
    .then(() => {
      initAllMaterializeCSS("Collapsible", "collapse");
      initAllMaterializeCSS("Materialbox", "materialBox");
    });
  // }
};

// * Render Order Items
// ? Tab Order
const tabOrderItems = (data, dataID) => {
  return `
    <li class="item" data-id="${dataID}">
      <div class="collapsible-header">
        <i class="material-icons">local_mall</i>
        <strong class="product">${data.product}</strong>
      </div>
      <div class="collapsible-body grey lighten-2">
        <h6><strong>Store Name (Optional)</strong></h6>
        <p class="store">
          ${data.store !== "None" ? data.store : "<em>None</em>"}
        </p>
        <h6><strong>Product Description (Optional)</strong></h6>
        <p class="productDesc">
          ${data.productDesc !== "None" ? data.productDesc : "<em>None</em>"}
        </p>
        <h6><strong>Unit Measurement</strong></h6>
        <p>
          <span class="unit">${data.unit}</span>
          <span class="measurement">${data.measurement}</span>
        </p>
        <h6><strong>Quantity</strong></h6>
        <p class="quantity">${data.quantity}</p>
        <h6><strong>Note (Optional)</strong></h6>
        <p class="note">
          ${data.note !== "None" ? data.note : "<em>None</em>"}
        </p>
        <h6><strong>Price</strong></h6>
        <p>
          <span class="priceTag">
            ${!isNaN(data.price) ? "&#8369;" : ""}
          </span>
          <span class="price">
            ${
              !isNaN(data.price)
                ? data.price
                : `<span class="red-text">${data.price}</span>`
            }
          </span>
        </p>
        <h6><strong>Total Price</strong></h6>
        <p>
          <span class="totalPriceTag">
            ${!isNaN(data.totalPrice) ? "&#8369;" : ""}
          </span>
          <span class="totalPrice">
            ${
              !isNaN(data.totalPrice)
                ? data.totalPrice
                : `<span class="red-text">${data.totalPrice}</span>`
            }
          </span>
        </p>
      </div>
    </li>
  `;
};

// * Render User Details
// ? Tab Profile
const renderUserDetails = (data, dataID) => {
  const tabProfile = document.querySelector("#tab-profile");
  const tabUserImage = tabProfile.querySelector(".user-image");
  const tabID = tabProfile.querySelector(".user-id");
  const tabName = tabProfile.querySelectorAll(".name");
  const tabEmail = tabProfile.querySelector(".email");
  const tabContact = tabProfile.querySelector(".contact");
  const tabAddress = tabProfile.querySelector(".address");
  const tabLandmark = tabProfile.querySelector(".landmark");

  const editAccountModal = document.querySelector("#edit-account-modal");
  const editAccountForm = editAccountModal.querySelector("#edit-account-form");

  tabID.innerHTML = userID;
  tabName.forEach((item) => (item.innerHTML = `${data.fname} ${data.lname}`));
  tabEmail.innerHTML = data.email;
  tabContact.innerHTML = data.contact;
  tabAddress.innerHTML = data.address;
  tabLandmark.innerHTML =
    data.landmark === "" ? "<em>None</em>" : data.landmark;

  const tableBody = document.querySelector(".table-body");
  const trUser = tableBody.querySelector(`.user[data-id="${userID}"]`);
  const trName = trUser.querySelector(".name");

  db.collection("getmoco_uploads")
    .where("uploadedBy", "==", userID)
    .where("description", "==", "profile")
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const docImage = doc.data().url;

          tabUserImage.src = docImage;
        });
      } else {
        tabUserImage.src = "/img/default-user.jpg";
      }
    })
    .then(() => {
      editAccountForm.reset();
      editAccountForm
        .querySelectorAll("label")
        .forEach((item) => (item.className = "active"));

      editAccountForm.firstName.value = data.fname;
      editAccountForm.lastName.value = data.lname;
      editAccountForm.contact.placeholder = data.contact;
      const selectOptions = editAccountForm.querySelector(
        `div[data-id="${settingsLoc}"] select`
      );
      if (selectOptions) {
        selectOptions.value =
          data.dmDestination + " | " + data.brgy + " | " + data.zip;
      }
      editAccountForm.street.value = data.street;
      editAccountForm.house.value = data.house;
      editAccountForm.landmark.value = data.landmark;

      trName.innerHTML = `${data.lname}, ${data.fname}`;

      editAccountForm.new_email.disabled = false;
      editAccountForm.new_password.disabled = false;
      editAccountForm.new_confirm_password.disabled = false;
    });
};

// * Render Users List
const renderUsersList = (data, dataID, type, count) => {
  if (type === "all" || type === "verified") {
    let orderCount = 0;
    let rptSub = 0;
    let rptRec = 0;
    let userType = data.type === "user" ? "customerID" : "driverID";

    db.collection("getmoco_orders")
      .where(userType, "==", dataID)
      .get()
      .then((snap) => {
        if (!snap.empty) {
          snap.forEach((doc) => {
            const status = doc.data().status;

            // if (status === "paid" || status === "toPay") {
            orderCount++;
            // }
          });
        }
      });
    db.collection("getmoco_reports")
      .where("reportedBy", "==", dataID)
      .get()
      .then((snap) => {
        if (!snap.empty) {
          snap.forEach((doc) => {
            return rptSub++;
          });
        }
      });
    db.collection("getmoco_reports")
      .where("reportedUser", "==", dataID)
      .get()
      .then((snap) => {
        if (!snap.empty) {
          snap.forEach((doc) => {
            return rptRec++;
          });
        }
      })
      .then(() => {
        const tableBody = document.querySelector(".table-body");

        const html = `
          <tr class="user" data-id="${dataID}">
            <td class="count">${count}</td>
            <td class="name">${data.lname}, ${data.fname}</td>
            <td class="orderCount">${orderCount}</td>
            <td class="rptSub">${rptSub}</td>
            <td class="rptRec">${rptRec}</td>
            <td class="verification">
              <span class="
                ${
                  data.verified === "toVerify"
                    ? "orange-text"
                    : data.verified === "unverified"
                    ? "red-text"
                    : data.verified === "verified"
                    ? "green-text"
                    : data.verified
                }
              ">
                ${
                  data.verified === "toVerify"
                    ? "To Verify"
                    : data.verified === "unverified"
                    ? "Unverified"
                    : data.verified === "verified"
                    ? "Verified"
                    : data.verified
                }
              </span>
            </td>
            <td class="status">
              <span class="
                ${
                  data.status === "active"
                    ? "green-text"
                    : data.status === "inactive"
                    ? "orange-text"
                    : data.status === "disabled"
                    ? "red-text"
                    : data.status
                }
              ">
                ${
                  data.status === "active"
                    ? "Active"
                    : data.status === "inactive"
                    ? "Inactive"
                    : data.status === "disabled"
                    ? "Disabled"
                    : data.status
                }
              </span>
            </td>
            <td>
              <div class="" data-id="${dataID}">
                <i
                  class="material-icons modal-trigger tooltipped view"
                  href="#user_modal"
                  style="cursor: pointer"
                  data-position="top"
                  data-tooltip="View User"
                  title="View User"
                >
                  remove_red_eye
                </i>
              </div>
            </td>
          </tr>
        `;

        tableBody.innerHTML += html;
      });
  } else if (type === "reportedUserType") {
    let reportedUser;
    let reportedBy;

    db.collection("getmoco_users")
      .doc(data.reportedUser)
      .get()
      .then((doc) => {
        return (reportedUser = doc.data().lname + ", " + doc.data().fname);
      });
    db.collection("getmoco_users")
      .doc(data.reportedBy)
      .get()
      .then((doc) => {
        return (reportedBy = doc.data().lname + ", " + doc.data().fname);
      })
      .then(() => {
        const tableBody = document.querySelector(".table-body");

        const html = `
          <tr class="report" data-id="${dataID}">
            <td class="count">${count}</td>
            <td class="user" data-id="${data.reportedUser}">
              <span class="name">${reportedUser}</span>
              <span class="verification" style="display: none;">
                <span style="display: none;"></span>
              </span>
              <span class="status" style="display: none;">
                <span style="display: none;"></span>
              </span>
            </td>
            <td class="reportedBy">${reportedBy}</td>
            <td class="details">${data.details}</td>
            <td class="date">
              ${data.created.toDate().toLocaleString("en-US", {
                weekday: "short",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              })}
            </td>
            <td>
              <div 
                class="actions" 
                data-id="${data.reportedUser}"
                data-report-id="${dataID}"
              >
                <i
                  class="material-icons modal-trigger tooltipped view"
                  href="#user_modal"
                  style="cursor: pointer"
                  data-position="top"
                  data-tooltip="View User"
                  title="View User"
                  onclick='
                    ${document.querySelector(".tab-reports").click()}
                    ${(document.querySelector(
                      "#tab-reports select"
                    )[1].selected = true)}
                  '
                >
                  remove_red_eye
                </i>
              </div>
            </td>
          </tr>
        `;

        tableBody.innerHTML += html;
      });
  }
};

// * Set Users Table Head
const setUsersTableHead = (type) => {
  const tableHead = document.querySelector(".table-head");

  if (type === "all" || type === "verified") {
    const html = `
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Orders</th>
        <th>Reports Submitted</th>
        <th>Reports Received</th>
        <th>Verification</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    `;

    tableHead.innerHTML += html;
  } else if (type === "reportedUserType") {
    const html = `
      <tr>
        <th>#</th>
        <th>Reported User</th>
        <th>Reported By</th>
        <th>Details</th>
        <th>Date</th>
        <th>Actions</th>
      </tr>
    `;

    tableHead.innerHTML += html;
  }
};

/**
 ** ****************************************************************************
 **
 ** profile.html / d_profile.html / a_profile.html
 **
 ** ****************************************************************************
 */

// * New Email or New Pass on Input
const newEmailPassLimit = (val, type) => {
  const editAccountModal = document.querySelector("#edit-account-modal");
  const editAccountForm = editAccountModal.querySelector("#edit-account-form");

  const newEmail = editAccountForm.new_email;
  const newPassword = editAccountForm.new_password;
  const newConfirmPassword = editAccountForm.new_confirm_password;

  if (type === "email") {
    if (val !== "") {
      newEmail.disabled = false;
      newPassword.disabled = true;
      newConfirmPassword.disabled = true;

      newPassword.value = "";
      newConfirmPassword.value = "";
    } else {
      // newEmail.disabled = true;
      newPassword.disabled = false;
      newConfirmPassword.disabled = false;

      newEmail.value = "";
    }
  } else if (type === "pass") {
    if (val !== "") {
      newEmail.disabled = true;
      newPassword.disabled = false;
      newConfirmPassword.disabled = false;

      newEmail.value = "";
    } else {
      newEmail.disabled = false;
      // newPassword.disabled = true;
      // newConfirmPassword.disabled = true;

      newPassword.value = "";
      newConfirmPassword.value = "";
    }
  } else if (type === "confirmPass") {
    if (val !== "") {
      newEmail.disabled = true;
      newPassword.disabled = false;
      newConfirmPassword.disabled = false;

      newEmail.value = "";
    } else {
      newEmail.disabled = false;
      // newPassword.disabled = true;
      // newConfirmPassword.disabled = true;

      newPassword.value = "";
      newConfirmPassword.value = "";
    }
  }
};

// * Render Profile Info
const renderProfileInfo = (userID, data, dataID, user) => {
  const profileContainer = document.querySelector(".profile");
  const profPic = profileContainer.querySelector(".user-image");
  const profName = profileContainer.querySelectorAll(".name");
  const profEmail = profileContainer.querySelector(".email");
  const profContact = profileContainer.querySelector(".contact");
  const profAddress = profileContainer.querySelector(".address");
  const profLandmark = profileContainer.querySelector(".landmark");

  const editAccountModal = document.querySelector("#edit-account-modal");
  const editAccountForm = editAccountModal.querySelector("#edit-account-form");

  const verifyAccountModal = document.querySelector("#verify-account-modal");
  const verifiedContainer = verifyAccountModal.querySelector(".verified");
  const toVerifyContainer = verifyAccountModal.querySelector(".toVerify");
  const unverifiedContainer = verifyAccountModal.querySelector(".unverified");
  const verifyAccountForm = unverifiedContainer.querySelector(
    "#verify-account-form"
  );
  const uploadButton = verifyAccountForm.querySelector(".upload-button");

  profName.forEach((item) => (item.innerHTML = `${data.fname} ${data.lname}`));
  profEmail.innerHTML = user.email;
  profContact.innerHTML = data.contact;
  profAddress.innerHTML = data.address;
  profLandmark.innerHTML =
    data.landmark === "" ? "<em>None</em>" : data.landmark;

  db.collection("getmoco_uploads")
    .where("uploadedBy", "==", userID)
    .where("description", "==", "profile")
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const docImage = doc.data().url;

          profPic.src = docImage;
        });
      } else {
        profPic.src = "/img/default-user.jpg";
      }
    })
    .then(() => {
      editAccountForm.reset();
      editAccountForm
        .querySelectorAll("label")
        .forEach((item) => (item.className = "active"));

      editAccountForm.firstName.value = data.fname;
      editAccountForm.lastName.value = data.lname;
      editAccountForm.contact.placeholder = data.contact;
      const selectOptions = editAccountForm.querySelector(
        `div[data-id="${settingsLoc}"] select`
      );
      if (selectOptions) {
        selectOptions.value =
          data.dmDestination + " | " + data.brgy + " | " + data.zip;
      }
      editAccountForm.street.value = data.street;
      editAccountForm.house.value = data.house;
      editAccountForm.landmark.value = data.landmark;
      //editAccountForm.email.placeholder = user.email;

      editAccountForm.new_email.disabled = false;
      editAccountForm.new_password.disabled = false;
      editAccountForm.new_confirm_password.disabled = false;
    })
    .then(() => {
      db.collection("getmoco_users")
        .doc(userID)
        .get()
        .then((doc) => {
          const docVerified = doc.data().verified;

          if (docVerified === "verified") {
            verifiedContainer.style.display = "block";
            toVerifyContainer.style.display = "none";
            unverifiedContainer.style.display = "none";
            uploadButton.disabled = true;
          } else if (docVerified === "toVerify") {
            verifiedContainer.style.display = "none";
            toVerifyContainer.style.display = "block";
            unverifiedContainer.style.display = "none";
            uploadButton.disabled = true;
          } else {
            verifiedContainer.style.display = "none";
            toVerifyContainer.style.display = "none";
            unverifiedContainer.style.display = "block";
            uploadButton.disabled = false;
          }
        });
    });
};

/**
 ** ****************************************************************************
 **
 ** order_details.html / d_order_details.html
 **
 ** ****************************************************************************
 */

// * Modify Order Details
const modifyOrderDetails = (data, dataID, type) => {
  // Items list
  const itemsListContainer = document.querySelector(".items-list");
  const itemAddressOrg = itemsListContainer.querySelector(".addressOrg");
  const itemLandmarkOrg = itemsListContainer.querySelector(".landmarkOrg");
  const itemAddressDrp = itemsListContainer.querySelector(".addressDrp");
  const itemLandmarkDrp = itemsListContainer.querySelector(".landmarkDrp");

  // Payment & Receipt
  const paymentUser = document.querySelector(".payment-user");
  const payOrderID = paymentUser.querySelector(".order-id");
  const payItemsPrice = paymentUser.querySelector(".itemsPrice");
  // const payWeight = paymentUser.querySelector(".totalWeight");
  const payDistance = paymentUser.querySelector(".totalDistance");
  const payServiceFee = paymentUser.querySelector(".serviceFee");
  const payTotalItemsPrice = paymentUser.querySelector(".totalItemsPrice");
  const payUserImage = paymentUser.querySelector(".user-image");
  const payUserID = paymentUser.querySelector(".user-id");
  const payUserName = paymentUser.querySelector(".user-name");

  // Order Status & Receive
  const orderStatusContainer = document.querySelector(".order-status");
  const ordShipmentStatus =
    orderStatusContainer.querySelector(".shipment-status");
  const ordShipmentTime = orderStatusContainer.querySelector(".shipment");
  const ordDeliveredTime = orderStatusContainer.querySelector(".delivered");
  const ordReceivedTime = orderStatusContainer.querySelector(".received");
  const ordReceiveButton =
    orderStatusContainer.querySelector(".receive-button");

  // ? =====================================================================

  itemAddressOrg.innerHTML = data.addressOrg;
  itemLandmarkOrg.innerHTML =
    data.landmarkOrg === "" ? "<em>None</em>" : data.landmarkOrg;

  itemAddressDrp.innerHTML = data.addressDrp;
  itemLandmarkDrp.innerHTML =
    data.landmarkDrp === "" ? "<em>None</em>" : data.landmarkDrp;

  payOrderID.innerHTML = dataID;
  payItemsPrice.innerHTML = data.itemsPrice;
  // payWeight.innerHTML = data.totalWeight;
  payDistance.innerHTML = data.totalDistance;
  payServiceFee.innerHTML = data.serviceFee;
  payTotalItemsPrice.innerHTML = data.totalItemsPrice;

  let userID = type === "customer" ? data.driverID : data.customerID;

  payUserID.innerHTML = userID;

  db.collection("getmoco_uploads")
    .where("uploadedBy", "==", userID)
    .where("description", "==", "profile")
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const docImage = doc.data().url;

          payUserImage.src = docImage;
        });
      } else {
        payUserImage.src = "/img/default-user.jpg";
      }
    })

    .then(() => {
      db.collection("getmoco_users")
        .doc(userID)
        .get()
        .then((doc) => {
          const docFname = doc.data().fname;
          const docLname = doc.data().lname;
          const name = docFname + " " + docLname;

          payUserName.innerHTML = name;
        });
    })
    .then(() => {
      const orderConfirmed = data.orderConfirmed; // upload id
      const shipment =
        data.shipment === ""
          ? data.shipment
          : data.shipment.toDate().toLocaleString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            });
      const delivered =
        data.delivered === ""
          ? data.delivered
          : data.delivered.toDate().toLocaleString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            });
      const received =
        data.received === ""
          ? data.received
          : data.received !== null
          ? data.received.toDate().toLocaleString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            })
          : new Date().toLocaleString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            });

      if (
        orderConfirmed === "" &&
        shipment === "" &&
        delivered === "" &&
        received === ""
      ) {
        ordShipmentStatus.innerHTML = "Ongoing"; // In Purchase
        ordShipmentTime.innerHTML = "Ongoing"; // In Purchase
        ordDeliveredTime.innerHTML = "Ongoing"; // In Purchase
        ordReceivedTime.innerHTML = "Ongoing"; // In Purchase
        ordReceiveButton.disabled = true;
      } else if (
        orderConfirmed !== "" &&
        shipment === "" &&
        delivered === "" &&
        received === ""
      ) {
        ordShipmentStatus.innerHTML = "Ongoing"; // To Ship
        ordShipmentTime.innerHTML = "Ongoing"; // To Ship
        ordDeliveredTime.innerHTML = "Ongoing"; // To Ship
        ordReceivedTime.innerHTML = "Ongoing"; // In Ship
        ordReceiveButton.disabled = true;
      } else if (
        orderConfirmed !== "" &&
        shipment !== "" &&
        delivered === "" &&
        received === ""
      ) {
        ordShipmentStatus.innerHTML = "Ongoing"; // In Shipment
        ordShipmentTime.innerHTML = shipment;
        ordDeliveredTime.innerHTML = "Ongoing"; // In Shipment
        ordReceivedTime.innerHTML = "Ongoing"; // In Shipment
        ordReceiveButton.disabled = true;
      } else if (
        orderConfirmed !== "" &&
        shipment !== "" &&
        delivered !== "" &&
        received === ""
      ) {
        ordShipmentStatus.innerHTML = "Delivered";
        ordShipmentTime.innerHTML = shipment;
        ordDeliveredTime.innerHTML = delivered;
        ordReceivedTime.innerHTML = `To Receive`;
        ordReceiveButton.disabled = false;
      } else {
        ordShipmentStatus.innerHTML = "Completed";
        ordShipmentTime.innerHTML = shipment;
        ordDeliveredTime.innerHTML = delivered;
        ordReceivedTime.innerHTML = received;
        ordReceiveButton.disabled = true;
      }
    });
};

// * Set Order Items
const setOrderItems = (customerID, orderID) => {
  // Items list
  const itemsListContainer = document.querySelector(".items-list");
  const orderItemsContainer = itemsListContainer.querySelector(".order-items");

  db.collection("getmoco_items")
    .where("customerID", "==", customerID)
    .where("orderID", "==", orderID)
    .get()
    .then((snapshot) => {
      // console.log(snapshot);

      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const html = `
            <li class="item" data-id="${doc.id}">
              <div class="collapsible-header">
                <i class="material-icons">local_mall</i>
                <strong class="product">${doc.data().product}</strong>
              </div>
              <div class="collapsible-body grey lighten-2">
                <h6><strong>Store Name (Optional)</strong></h6>
                <p class="store">
                  ${
                    doc.data().store !== "None"
                      ? doc.data().store
                      : "<em>None</em>"
                  }
                </p>
                <h6><strong>Product Description (Optional)</strong></h6>
                <p class="productDesc">
                  ${
                    doc.data().productDesc !== "None"
                      ? doc.data().productDesc
                      : "<em>None</em>"
                  }
                </p>
                <h6><strong>Unit Measurement</strong></h6>
                <p>
                  <span class="unit">${doc.data().unit}</span>
                  <span class="measurement">${doc.data().measurement}</span>
                </p>
                <h6><strong>Quantity</strong></h6>
                <p class="quantity">${doc.data().quantity}</p>
                <h6><strong>Note (Optional)</strong></h6>
                <p class="note">
                  ${
                    doc.data().note !== "None"
                      ? doc.data().note
                      : "<em>None</em>"
                  }
                </p>
                <h6><strong>Price</strong></h6>
                <p>
                  <span class="priceTag">
                    ${!isNaN(doc.data().price) ? "&#8369;" : ""}
                  </span>
                  <span class="price">
                    ${
                      !isNaN(doc.data().price)
                        ? doc.data().price
                        : `<span class="red-text">${doc.data().price}</span>`
                    }
                  </span>
                </p>
                <h6><strong>Total Price</strong></h6>
                <p>
                  <span class="totalPriceTag">
                    ${!isNaN(doc.data().totalPrice) ? "&#8369;" : ""}
                  </span>
                  <span class="totalPrice">
                    ${
                      !isNaN(doc.data().totalPrice)
                        ? doc.data().totalPrice
                        : `<span class="red-text">
                            ${doc.data().totalPrice}
                          </span>`
                    }
                  </span>
                </p>
              </div>
            </li>
          `;

          orderItemsContainer.innerHTML += html;
        });
      } else {
        const html = `
            <li class="item" data-id="${"<em>None</em>"}">
              <div class="collapsible-header">
                <i class="material-icons">local_mall</i>
                <strong class="product">${"<em>None</em>"}</strong>
              </div>
              <div class="collapsible-body grey lighten-2">
                <h6><strong>Store Name (Optional)</strong></h6>
                <p class="store">
                  ${"<em>None</em>"}
                </p>
                <h6><strong>Product Description (Optional)</strong></h6>
                <p class="productDesc">
                ${"<em>None</em>"}
                </p>
                <h6><strong>Unit Measurement</strong></h6>
                <p class="unit">${"<em>None</em>"}</p>
                <h6><strong>Quantity</strong></h6>
                <p class="quantity">${"<em>None</em>"}</p>
                <h6><strong>Note (Optional)</strong></h6>
                <p class="note">
                ${"<em>None</em>"}
                </p>
                <h6><strong>Price</strong></h6>
                <p>
                  <span class="priceTag">
                  </span>
                  <span class="price">
                    ${"<em>None</em>"}
                  </span>
                </p>
                <h6><strong>Total Price</strong></h6>
                <p>
                  <span class="totalPriceTag">
                  </span>
                  <span class="totalPrice">
                    ${"<em>None</em>"}
                  </span>
                </p>
              </div>
            </li>
          `;

        orderItemsContainer.innerHTML += html;
      }
    });
};

/**
 ** ****************************************************************************
 **
 ** driver_delivery.html
 **
 ** ****************************************************************************
 */

// * Modify Delivery Status
const modifyDeliveryStatus = (data, dataID) => {
  const driverHomeButton = document.querySelector(".driver-home-button");

  const deliveryContainer = document.querySelector(".delivery");
  const dOrderID = deliveryContainer.querySelector(".orderID");
  const dCustomer = deliveryContainer.querySelector(".name");
  const dContact = deliveryContainer.querySelector(".contact");
  const dAddressOrg = deliveryContainer.querySelector(".addressOrg");
  const dAddressDrp = deliveryContainer.querySelector(".addressDrp");
  const dShipment = deliveryContainer.querySelector(".shipment");
  const dDelivered = deliveryContainer.querySelector(".delivered");

  driverHomeButton.style.display = "none";

  db.collection("getmoco_users")
    .doc(data.customerID)
    .get()
    .then((doc) => {
      const name = `${doc.data().fname} ${doc.data().lname}`;
      const contact = doc.data().contact;

      dCustomer.innerHTML = name;
      dContact.innerHTML = contact;
    });
  db.collection("getmoco_orders")
    .doc(data.orderID)
    .get()
    .then((doc) => {
      const docAddressOrg = doc.data().addressOrg;
      const docAddressDrp = doc.data().addressDrp;

      dOrderID.innerHTML = data.orderID;
      dAddressOrg.innerHTML = docAddressOrg;
      dAddressDrp.innerHTML = docAddressDrp;

      const shipmentDate = data.shipment.toDate().toLocaleString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });
      dShipment.innerHTML = shipmentDate;

      if (data.delivered === "") {
        dDelivered.innerHTML = "Ongoing"; // In Shipment

        driverHomeButton.style.display = "none";
      } else {
        const deliveredDate =
          data.delivered === ""
            ? data.delivered
            : data.delivered !== null
            ? data.delivered.toDate().toLocaleString("en-US", {
                weekday: "short",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              })
            : new Date().toLocaleString("en-US", {
                weekday: "short",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              });
        dDelivered.innerHTML = deliveredDate;

        driverHomeButton.style.display = "block";
      }
    });
};

/**
 ** ****************************************************************************
 **
 ** orders.html / d_orders.html
 **
 ** ****************************************************************************
 */

// * Render Orders List
const renderOrdersList = (data, dataID, type, received) => {
  const listResult = document.querySelector(".list-result");

  let date;

  if (type === "customer") {
    data.shipStatus === "toShip"
      ? (date = data.orderConfirmed.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }))
      : !received
      ? (date = data.delivered.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }))
      : (date = data.received.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }));
  } else {
    date = data.delivered.toDate().toLocaleString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });

    data.orderReceived === false
      ? (date = data.delivered.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }))
      : (date = data.received.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }));
  }

  if (type === "customer") {
    const html = `
      <a class="collection-item avatar order black-text" href="#" data-id="${dataID}">
        <i class="material-icons circle" data-id="${dataID}">shopping_cart</i>
        <p data-id="${dataID}">
          Address: 
          <span class="addressOrg orange-text" data-id="${dataID}">
           ${data.addressOrg}
          </span>
        </p>
        <p data-id="${dataID}">
          Landmark: 
          <span class="landmarkOrg teal-text" data-id="${dataID}">
            ${data.landmarkOrg === "" ? "<em>None</em>" : data.landmarkOrg} 
          </span>
        </p>
        <p data-id="${dataID}">
          <span class="date" data-id="${dataID}">
            ${data.shipStatus === "toShip" ? `Start: ` : `Delivered: `}
            <span class="green-text">${date}</span>
          </span>
        </p>
      </a>
    `;

    listResult.innerHTML += html;
  } else {
    const html = `
      <a class="collection-item avatar order black-text" href="#" data-id="${dataID}">
        <i class="material-icons circle" data-id="${dataID}">shopping_cart</i>
        <p data-id="${dataID}">
          Address: 
          <span class="addressOrg orange-text" data-id="${dataID}">
            ${data.addressOrg}
          </span>
        </p>
        <p data-id="${dataID}">
          Landmark: 
          <span class="landmarkOrg teal-text" data-id="${dataID}">
            ${data.landmarkOrg === "" ? "<em>None</em>" : data.landmarkOrg} 
          </span>
        </p>
        <p data-id="${dataID}">
          <span class="date" data-id="${dataID}">
            ${data.orderReceived === false ? `Delivered: ` : `Received: `}
            <span class="green-text">${date}</span>
          </span>
        </p>
      </a>
    `;

    listResult.innerHTML += html;
  }
};

/**
 ** ****************************************************************************
 **
 ** set_price_list.html
 **
 ** ****************************************************************************
 */

// ? Call renderChats(data, dataID, type) here from check_price_list.html

// * Update Set Price List
const updateSetPriceList = (data, dataID, orderID, customerID) => {
  db.collection("getmoco_orders")
    .doc(orderID)
    .onSnapshot(
      (doc) => {
        const totalDistance = document.querySelector(".totalDistance");
        // const totalWeight = document.querySelector(".totalWeight");
        const itemsPrice = document.querySelector(".itemsPrice");
        const serviceFee = document.querySelector(".serviceFee");
        const change = document.querySelector(".change");
        const totalItemsPrice = document.querySelector(".totalItemsPrice");

        const totalItemsPriceValue = doc.data().totalItemsPrice;

        // totalWeight.innerHTML = doc.data().totalWeight;
        totalDistance.innerHTML = doc.data().totalDistance;
        itemsPrice.innerHTML = doc.data().itemsPrice;
        serviceFee.innerHTML = doc.data().serviceFee;
        change.innerHTML = doc.data().change;
        totalItemsPrice.innerHTML = totalItemsPriceValue;

        const item = document.querySelector(`.item[data-id="${dataID}"]`);
        item.querySelector(".product").innerHTML = data.product;
        data.clientNotif > 0 && item.className === "item"
          ? (item.querySelector(".collapsible-header span").className =
              "new badge") +
            (item.querySelector(".collapsible-header span").textContent =
              data.clientNotif)
          : (item.querySelector(".collapsible-header span").className = "") +
            (item.querySelector(".collapsible-header span").textContent = "");
        item.querySelector(".store").innerHTML =
          data.store !== "None" ? data.store : "<em>None</em>";
        item.querySelector(".productDesc").innerHTML =
          data.productDesc !== "None" ? data.productDesc : "<em>None</em>";
        item.querySelector(".unit").innerHTML = data.unit;
        item.querySelector(".measurement").innerHTML = data.measurement;
        item.querySelector(".quantity").innerHTML = data.quantity;
        item.querySelector(".note").innerHTML =
          data.note !== "None" ? data.note : "<em>None</em>";

        !isNaN(data.price)
          ? (item.querySelector(".priceTag").innerHTML = "&#8369;") +
            (item.querySelector(".price").innerHTML = data.price)
          : (item.querySelector(".priceTag").innerHTML = "") +
            (item.querySelector(
              ".price"
            ).innerHTML = `<span class="red-text">${data.price}</span>`);

        !isNaN(data.totalPrice)
          ? (item.querySelector(".totalPriceTag").innerHTML = "&#8369;") +
            (item.querySelector(".totalPrice").innerHTML = data.totalPrice)
          : (item.querySelector(".totalPriceTag").innerHTML = "") +
            (item.querySelector(
              ".totalPrice"
            ).innerHTML = `<span class="red-text">${data.totalPrice}</span>`);

        const priceListStatus = document.querySelector(".status");

        let priceLimit = 0;

        // * Price Check
        db.collection("getmoco_settings")
          .where("settings", "==", "ALL")
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              return (priceLimit = doc.data().priceLimit);
            });
          })
          .then(() => {
            db.collection("getmoco_items")
              .where("customerID", "==", customerID)
              .where("orderID", "==", orderID)
              .get()
              .then((snapshot2) => {
                const docLength = snapshot2.size;
                let priceCheck = 0;

                snapshot2.forEach((doc) => {
                  const price = doc.data().price;
                  const totalPrice = doc.data().totalPrice;

                  if (price !== "0.00" && totalPrice !== "0.00") {
                    priceCheck++;
                  }
                });

                if (
                  priceCheck === docLength &&
                  parseFloat(totalItemsPriceValue) <= priceLimit
                ) {
                  priceListStatus.innerHTML =
                    "Price Setup Complete, Waiting for Approval";
                } else if (
                  priceCheck === docLength &&
                  parseFloat(totalItemsPriceValue) > priceLimit
                ) {
                  priceListStatus.innerHTML =
                    '<span class="red-text">Price Limit Exceeded, Waiting for Customer</span>';
                } else {
                  priceListStatus.innerHTML = "Please Setup Prices";
                }

                // console.log("update: ", priceCheck, docLength);
              })
              .catch((err) => {
                console.log(err.message);
              });
          });
      },
      (err) => {
        console.log(err);
      }
    );
};

// * Render Set Price List
const renderSetPriceList = (data, dataID, orderID, customerID) => {
  db.collection("getmoco_orders")
    .doc(orderID)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const totalDistance = document.querySelector(".totalDistance");
        // const totalWeight = document.querySelector(".totalWeight");
        const itemsPrice = document.querySelector(".itemsPrice");
        const serviceFee = document.querySelector(".serviceFee");
        const change = document.querySelector(".change");
        const totalItemsPrice = document.querySelector(".totalItemsPrice");

        const totalItemsPriceValue = doc.data().totalItemsPrice;

        // totalWeight.innerHTML = doc.data().totalWeight;
        totalDistance.innerHTML = doc.data().totalDistance;
        itemsPrice.innerHTML = doc.data().itemsPrice;
        serviceFee.innerHTML = doc.data().serviceFee;
        change.innerHTML = doc.data().change;
        totalItemsPrice.innerHTML = totalItemsPriceValue;

        const priceListStatus = document.querySelector(".status");

        let priceLimit = 0;

        // * Price Check
        db.collection("getmoco_settings")
          .where("settings", "==", "ALL")
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              return (priceLimit = doc.data().priceLimit);
            });
          })
          .then(() => {
            db.collection("getmoco_items")
              .where("customerID", "==", customerID)
              .where("orderID", "==", orderID)
              .get()
              .then((snapshot2) => {
                const docLength = snapshot2.size;
                let priceCheck = 0;

                snapshot2.forEach((doc) => {
                  const price = doc.data().price;
                  const totalPrice = doc.data().totalPrice;

                  if (price !== "0.00" && totalPrice !== "0.00") {
                    priceCheck++;
                  }
                });

                if (
                  priceCheck === docLength &&
                  parseFloat(totalItemsPriceValue) <= priceLimit
                ) {
                  priceListStatus.innerHTML =
                    "Price Setup Complete, Waiting for Approval";
                } else if (
                  priceCheck === docLength &&
                  parseFloat(totalItemsPriceValue) > priceLimit
                ) {
                  priceListStatus.innerHTML =
                    '<span class="red-text">Price Limit Exceeded, Waiting for Customer</span>';
                } else {
                  priceListStatus.innerHTML = "Please Setup Prices";
                }

                // console.log("render: ", priceCheck, docLength);
              })
              .then(() => {
                const orderItems = document.querySelector(".order-items");

                const html = `
                  <li class="item" data-id="${dataID}">
                    <div class="collapsible-header">
                      <i class="material-icons">local_mall</i>
                      <strong class="product">${data.product}</strong>
                      ${
                        data.clientNotif > 0
                          ? '<span class="new badge">' +
                            data.clientNotif +
                            "</span>"
                          : "<span></span>"
                      }
                    </div>
                    <div class="collapsible-body grey lighten-2">
                      <h6><strong>Store Name (Optional)</strong></h6>
                      <p class="store">
                        ${data.store !== "None" ? data.store : "<em>None</em>"}
                      </p>
                      <h6><strong>Product Description (Optional)</strong></h6>
                      <p class="productDesc">
                        ${
                          data.productDesc !== "None"
                            ? data.productDesc
                            : "<em>None</em>"
                        }
                      </p>
                      <h6><strong>Unit Measurement</strong></h6>
                      <p>
                        <span class="unit">${data.unit}</span>
                        <span class="measurement">${data.measurement}</span>
                      </p>
                      <h6><strong>Quantity</strong></h6>
                      <p class="quantity">${data.quantity}</p>
                      <h6><strong>Note (Optional)</strong></h6>
                      <p class="note">
                        ${data.note !== "None" ? data.note : "<em>None</em>"}
                      </p>
                      <h6><strong>Price</strong></h6>
                      <p>
                        <span class="priceTag">
                          ${!isNaN(data.price) ? "&#8369;" : ""}
                        </span>
                        <span class="price">
                          ${
                            !isNaN(data.price)
                              ? data.price
                              : `<span class="red-text">${data.price}</span>`
                          }
                        </span>
                      </p>
                      <h6><strong>Total Price</strong></h6>
                      <p>
                        <span class="totalPriceTag">
                          ${!isNaN(data.totalPrice) ? "&#8369;" : ""}
                        </span>
                        <span class="totalPrice">
                          ${
                            !isNaN(data.totalPrice)
                              ? data.totalPrice
                              : `<span class="red-text">${data.totalPrice}</span>`
                          }
                        </span>
                      </p>
                      <div 
                        class="center-align tools-container" 
                        data-id="${dataID}"
                      >
                        <i
                          class="material-icons edit modal-trigger
                          "
                          href="#edit_item_modal"
                          style="cursor: pointer;"
                          data-position="top"
                          data-tooltip="Edit Item"
                          title="Edit Item"
                        >
                          edit
                        </i>
                      </div>
                    </div>
                  </li>
                `;

                orderItems.innerHTML += html;
              });
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

// * Show Client Response Cancel or Confirm
const showClientResponse = (data, dataID) => {
  const notifCancel = document.querySelector("#notif_cancel_modal");
  const notifConfirm = document.querySelector("#notif_confirm_modal");

  if (data.request === "confirmed") {
    M.Modal.getInstance(notifConfirm).open();
    M.Modal.getInstance(notifConfirm).options.dismissible = false;
  } else if (data.request === "cancelled") {
    M.Modal.getInstance(notifCancel).open();
    M.Modal.getInstance(notifCancel).options.dismissible = false;
  }
};

/**
 ** ****************************************************************************
 **
 ** check_price_list.html
 **
 ** ****************************************************************************
 */

// * Render Chats
const renderChats = (data, dataID, type) => {
  if (data.customerID === customerID && data.driverID === driverID) {
    const chatModal = document.querySelector("#chat_modal");
    const listResult = chatModal.querySelector(".list-result");

    const userID = type === "user" ? driverID : customerID;
    const chatBy = data.chatBy;
    const chatByType = data.chatByType;

    const date =
      data.created === ""
        ? data.created
        : data.created !== null
        ? data.created.toDate().toLocaleString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          })
        : new Date().toLocaleString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          });

    let name;
    let userImage;

    db.collection("getmoco_users")
      .doc(userID)
      .get()
      .then((doc) => {
        name = `${doc.data().fname} ${doc.data().lname}`;
      });
    db.collection("getmoco_uploads")
      .where("uploadedBy", "==", userID)
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
        if (type === chatByType) {
          const html = `
                <li class="collection-item teal lighten-4 chat" data-id="${dataID}">
                  <p class="content right-align">
                    ${
                      data.content !== "image"
                        ? data.content
                        : `<img class="responsive-img materialboxed" src="${data.url}">`
                    }
                  </p>
                  <p class="right-align"><small class="date grey-text">${date}</small></p>
                </li>
              `;

          listResult.innerHTML += html;
        } else {
          const html = `
              <li class="collection-item avatar grey lighten-3 chat" data-id="${dataID}">
                <img
                  src="${userImage}"
                  alt=""
                  class="circle materialboxed user-image"
                />
                <strong><span class="name">${name}</span></strong>
                <p class="content">
                  ${
                    data.content !== "image"
                      ? data.content
                      : `<img class="responsive-img materialboxed" src="${data.url}">`
                  }
                </p>
                <p><small class="date grey-text">${date}</small></p>
              </li>
            `;

          listResult.innerHTML += html;
        }

        initAllMaterializeCSS("Materialbox", "materialBox");
      })
      .then(() => {
        if (chatByType !== "user") {
          const chatUserButton = document.querySelector("#chat_button.user");
          const instanceUser = M.Tooltip.getInstance(chatUserButton);

          chatUserButton.setAttribute("data-tooltip", "New message here!");
          instanceUser.open();
          chatUserButton.setAttribute("data-tooltip", "Send message here.");
        } else {
          const chatDriverButton = document.querySelector(
            "#chat_button.driver"
          );
          const instanceDriver = M.Tooltip.getInstance(chatDriverButton);

          chatDriverButton.setAttribute("data-tooltip", "New message here!");
          instanceDriver.open();
          chatDriverButton.setAttribute("data-tooltip", "Send message here.");
        }

        initAllMaterializeCSS("Materialbox", "materialBox");
      });
  }
};

// * Update Get Price List
const updateGetPriceList = (data, dataID, orderID, customerID) => {
  db.collection("getmoco_orders")
    .doc(orderID)
    .onSnapshot(
      (doc) => {
        const totalDistance = document.querySelector(".totalDistance");
        // const totalWeight = document.querySelector(".totalWeight");
        const itemsPrice = document.querySelector(".itemsPrice");
        const serviceFee = document.querySelector(".serviceFee");
        const change = document.querySelector(".change");
        const totalItemsPrice = document.querySelector(".totalItemsPrice");

        const totalItemsPriceValue = doc.data().totalItemsPrice;

        // totalWeight.innerHTML = doc.data().totalWeight;
        totalDistance.innerHTML = doc.data().totalDistance;
        itemsPrice.innerHTML = doc.data().itemsPrice;
        serviceFee.innerHTML = doc.data().serviceFee;
        change.innerHTML = doc.data().change;
        totalItemsPrice.innerHTML = totalItemsPriceValue;

        const item = document.querySelector(`.item[data-id="${dataID}"]`);
        item.querySelector(".product").innerHTML = data.product;
        data.driverNotif > 0 && item.className === "item"
          ? (item.querySelector(".collapsible-header span").className =
              "new badge") +
            (item.querySelector(".collapsible-header span").textContent =
              data.driverNotif)
          : (item.querySelector(".collapsible-header span").className = "") +
            (item.querySelector(".collapsible-header span").textContent = "");
        item.querySelector(".store").innerHTML =
          data.store !== "None" ? data.store : "<em>None</em>";
        item.querySelector(".productDesc").innerHTML =
          data.productDesc !== "None" ? data.productDesc : "<em>None</em>";
        item.querySelector(".unit").innerHTML = data.unit;
        item.querySelector(".measurement").innerHTML = data.measurement;
        item.querySelector(".quantity").innerHTML = data.quantity;
        item.querySelector(".note").innerHTML =
          data.note !== "None" ? data.note : "<em>None</em>";

        !isNaN(data.price)
          ? (item.querySelector(".priceTag").innerHTML = "&#8369;") +
            (item.querySelector(".price").innerHTML = data.price)
          : (item.querySelector(".priceTag").innerHTML = "") +
            (item.querySelector(
              ".price"
            ).innerHTML = `<span class="red-text">${data.price}</span>`);

        !isNaN(data.totalPrice)
          ? (item.querySelector(".totalPriceTag").innerHTML = "&#8369;") +
            (item.querySelector(".totalPrice").innerHTML = data.totalPrice)
          : (item.querySelector(".totalPriceTag").innerHTML = "") +
            (item.querySelector(
              ".totalPrice"
            ).innerHTML = `<span class="red-text">${data.totalPrice}</span>`);

        const editContainer = document.querySelectorAll(".tools-container");
        const editIcon = document.querySelectorAll(".tools-container i");

        const cancelButton = document.querySelector(".cancel-button");
        const confirmButton = document.querySelector(".confirm-button");
        const priceListStatus = document.querySelector(".status");

        let priceLimit = 0;

        // * Price Check
        db.collection("getmoco_settings")
          .where("settings", "==", "ALL")
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              return (priceLimit = doc.data().priceLimit);
            });
          })
          .then(() => {
            db.collection("getmoco_items")
              .where("customerID", "==", customerID)
              .where("orderID", "==", orderID)
              .get()
              .then((snapshot2) => {
                const docLength = snapshot2.size;
                let priceCheck = 0;

                snapshot2.forEach((doc) => {
                  const price = doc.data().price;
                  const totalPrice = doc.data().totalPrice;

                  if (price !== "0.00" && totalPrice !== "0.00") {
                    priceCheck++;
                  }
                });

                if (
                  priceCheck === docLength &&
                  parseFloat(totalItemsPriceValue) <= priceLimit
                ) {
                  editContainer.forEach(
                    (item) => (item.style.display = "none")
                  );
                  editIcon.forEach(
                    (item) => (item.className = "material-icons edit")
                  );

                  priceListStatus.innerHTML = "Price Setup Complete";
                  cancelButton.disabled = false;
                  confirmButton.disabled = false;
                } else if (
                  priceCheck === docLength &&
                  parseFloat(totalItemsPriceValue) > priceLimit
                ) {
                  editContainer.forEach(
                    (item) => (item.style.display = "block")
                  );
                  editIcon.forEach(
                    (item) =>
                      (item.className = "material-icons edit modal-trigger")
                  );

                  priceListStatus.innerHTML =
                    '<span class="red-text">Price Limit Exceeded, Please Edit Item</span>';
                  cancelButton.disabled = true;
                  confirmButton.disabled = true;
                } else {
                  editContainer.forEach(
                    (item) => (item.style.display = "none")
                  );
                  editIcon.forEach(
                    (item) => (item.className = "material-icons edit")
                  );

                  priceListStatus.innerHTML = "Setting up prices, Please Wait";
                  cancelButton.disabled = true;
                  confirmButton.disabled = true;
                }

                // console.log("update: ", priceCheck, docLength);
              })
              .catch((err) => {
                console.log(err.message);
              });
          });
      },
      (err) => {
        console.log(err);
      }
    );
};

// * Render Get Price List
const renderGetPriceList = (data, dataID, orderID, customerID) => {
  db.collection("getmoco_orders")
    .doc(orderID)
    .get()
    .then((doc) => {
      if (!doc.empty) {
        const totalDistance = document.querySelector(".totalDistance");
        // const totalWeight = document.querySelector(".totalWeight");
        const itemsPrice = document.querySelector(".itemsPrice");
        const serviceFee = document.querySelector(".serviceFee");
        const change = document.querySelector(".change");
        const totalItemsPrice = document.querySelector(".totalItemsPrice");

        const totalItemsPriceValue = doc.data().totalItemsPrice;

        // totalWeight.innerHTML = doc.data().totalWeight;
        totalDistance.innerHTML = doc.data().totalDistance;
        itemsPrice.innerHTML = doc.data().itemsPrice;
        serviceFee.innerHTML = doc.data().serviceFee;
        change.innerHTML = doc.data().change;
        totalItemsPrice.innerHTML = totalItemsPriceValue;

        const cancelButton = document.querySelector(".cancel-button");
        const confirmButton = document.querySelector(".confirm-button");
        const priceListStatus = document.querySelector(".status");

        let priceLimit = 0;

        // * Price Check
        db.collection("getmoco_settings")
          .where("settings", "==", "ALL")
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              return (priceLimit = doc.data().priceLimit);
            });
          })
          .then(() => {
            db.collection("getmoco_items")
              .where("customerID", "==", customerID)
              .where("orderID", "==", orderID)
              .get()
              .then((snapshot2) => {
                const docLength = snapshot2.size;
                let priceCheck = 0;

                snapshot2.forEach((doc) => {
                  const price = doc.data().price;
                  const totalPrice = doc.data().totalPrice;

                  if (price !== "0.00" && totalPrice !== "0.00") {
                    priceCheck++;
                  }
                });

                if (
                  priceCheck === docLength &&
                  parseFloat(totalItemsPriceValue) <= priceLimit
                ) {
                  priceListStatus.innerHTML = "Price Setup Complete";
                  cancelButton.disabled = false;
                  confirmButton.disabled = false;
                } else if (
                  priceCheck === docLength &&
                  parseFloat(totalItemsPriceValue) > priceLimit
                ) {
                  priceListStatus.innerHTML =
                    '<span class="red-text">Price Limit Exceeded, Please Edit Item</span>';
                  cancelButton.disabled = true;
                  confirmButton.disabled = true;
                } else {
                  priceListStatus.innerHTML = "Setting up prices, Please Wait";
                  cancelButton.disabled = true;
                  confirmButton.disabled = true;
                }

                // console.log("render: ", priceCheck, docLength);
              })
              .then(() => {
                const orderItems = document.querySelector(".order-items");

                const html = `
                  <li class="item" data-id="${dataID}">
                    <div class="collapsible-header">
                      <i class="material-icons">local_mall</i>
                      <strong class="product">${data.product}</strong>
                      ${
                        data.driverNotif > 0
                          ? '<span class="new badge">' +
                            data.driverNotif +
                            "</span>"
                          : "<span></span>"
                      }
                    </div>
                    <div class="collapsible-body grey lighten-2">
                      <h6><strong>Store Name (Optional)</strong></h6>
                      <p class="store">
                        ${data.store !== "None" ? data.store : "<em>None</em>"}
                      </p>
                      <h6><strong>Product Description (Optional)</strong></h6>
                      <p class="productDesc">
                        ${
                          data.productDesc !== "None"
                            ? data.productDesc
                            : "<em>None</em>"
                        }
                      </p>\
                      <h6><strong>Unit Measurement</strong></h6>
                      <p>
                        <span class="unit">${data.unit}</span>
                        <span class="measurement">${data.measurement}</span>
                      </p>
                      <h6><strong>Quantity</strong></h6>
                      <p class="quantity">${data.quantity}</p>
                      <h6><strong>Note (Optional)</strong></h6>
                      <p class="note">
                        ${data.note !== "None" ? data.note : "<em>None</em>"}
                      </p>
                      <h6><strong>Price</strong></h6>
                      <p>
                        <span class="priceTag">
                          ${!isNaN(data.price) ? "&#8369;" : ""}
                        </span>
                        <span class="price">
                          ${
                            !isNaN(data.price)
                              ? data.price
                              : `<span class="red-text">${data.price}</span>`
                          }
                        </span>
                      </p>
                      <h6><strong>Total Price</strong></h6>
                      <p>
                        <span class="totalPriceTag">
                          ${!isNaN(data.totalPrice) ? "&#8369;" : ""}
                        </span>
                        <span class="totalPrice">
                          ${
                            !isNaN(data.totalPrice)
                              ? data.totalPrice
                              : `<span class="red-text">${data.totalPrice}</span>`
                          }
                        </span>
                      </p>
                      <div 
                        class="center-align tools-container" 
                        data-id="${dataID}"
                        ${
                          parseFloat(totalItemsPriceValue) > priceLimit
                            ? 'style="display: block;"'
                            : 'style="display: none;"'
                        }
                      >
                        <i
                          class="material-icons edit 
                          ${
                            parseFloat(totalItemsPriceValue) > priceLimit
                              ? "modal-trigger"
                              : ""
                          }
                          "
                          href="#edit_item_modal"
                          style="cursor: pointer;"
                          data-position="top"
                          data-tooltip="Edit Item"
                          title="Edit Item"
                        >
                          edit
                        </i>
                      </div>
                    </div>
                  </li>
                `;

                orderItems.innerHTML += html;
              });
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 ** ****************************************************************************
 **
 ** active_order.html
 **
 ** ****************************************************************************
 */

// * Render New Order
const renderNewOrder = (data, dataID) => {
  const ordStatus = data.status;

  if (ordStatus === "waiting") {
    const highListResult = document.querySelector(".high-list-result");
    const lowListResult = document.querySelector(".low-list-result");

    // Driver Details
    const id = data.customerID;
    let name = "";
    let customerImage;
    db.collection("getmoco_users")
      .doc(id)
      .get()
      .then((doc) => {
        name = doc.data().fname + " " + doc.data().lname;
      });
    db.collection("getmoco_uploads")
      .where("uploadedBy", "==", id)
      .where("description", "==", "profile")
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            customerImage = doc.data().url;
          });
        } else {
          customerImage = "/img/default-user.jpg";
        }
      })
      .then(() => {
        const date = data.created.toDate().toLocaleString("en-US", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });

        const html = `
            <a 
              class="collection-item avatar customer modal-trigger black-text" 
              data-id="${dataID}" 
              href="#view_customer_modal"
            >
              <img src="${customerImage}" alt="" class="circle customer-img" data-id="${dataID}">
              <h6 data-id="${dataID}">
                <strong class="name" data-id="${dataID}">
                  ${name}
                </strong>
              </h6>
              <p data-id="${dataID}">
                Date: 
                <span class="date green-text" data-id="${dataID}">${date}</span>
              </p>
              <hr>
              <p data-id="${dataID}">
                Store Location: 
                <span class="addressOrg orange-text" data-id="${dataID}">
                  ${data.addressOrg}
                </span>
              </p>
              <p data-id="${dataID}">
                Store Landmark: 
                <span class="landmarkOrg teal-text" data-id="${dataID}">
                  ${
                    data.landmarkOrg === "" ? "<em>None</em>" : data.landmarkOrg
                  }
                </span>
              </p>
              <hr>
              <p data-id="${dataID}">
                Delivery Address: 
                <span class="addressDrp orange-text" data-id="${dataID}">
                  ${data.addressDrp}
                </span>
              </p>
              <p data-id="${dataID}">
                Delivery Landmark: 
                <span class="landmarkDrp teal-text" data-id="${dataID}">
                  ${
                    data.landmarkDrp === "" ? "<em>None</em>" : data.landmarkDrp
                  }
                </span>
              </p>
              <hr>
              <p 
                data-id="${dataID}" 
                class="
                  ${
                    data.totalDistance >= 0 && data.totalDistance <= 5
                      ? "green-text"
                      : data.totalDistance >= 5.01 && data.totalDistance <= 20
                      ? "orange-text"
                      : "red-text"
                  }
                "
              >
                <span class="black-text">Distance:</span>
                <span class="totalDistance" data-id="${dataID}">
                  ${data.totalDistance}
                </span>
                km
              </p>
              <p 
                data-id="${dataID}" 
                class="
                  ${
                    data.totalDistance >= 0 && data.totalDistance <= 5
                      ? "green-text"
                      : data.totalDistance >= 5.01 && data.totalDistance <= 20
                      ? "orange-text"
                      : "red-text"
                  }
                "
              >
                <span class="black-text">Service Fee:</span>
                &#8369;
                <span class="serviceFee" data-id="${dataID}">
                  ${data.serviceFee}
                </span>
              </p>
              <p 
                data-id="${dataID}" 
                class="
                  ${data.prio ? "red-text" : "green-text"}
                "
              >
                <span class="black-text">Priority:</span>
                <span class="prio" data-id="${dataID}">
                  ${data.prio ? "High" : "Low"}
                </span>
              </p>
            </a>
          `;

        if (data.prio) {
          const highTempHtml = highListResult.innerHTML;
          highListResult.innerHTML = "";
          highListResult.innerHTML = html + highTempHtml;
        } else {
          const lowTempHtml = lowListResult.innerHTML;
          lowListResult.innerHTML = "";
          lowListResult.innerHTML = html + lowTempHtml;
        }
      });
  }
};

// * Update New Order
const updateNewOrder = (data, dataID) => {
  const ordStatus = data.status;

  if (ordStatus === "waiting") {
    renderNewOrder(data, dataID); // call again
  } else if (ordStatus !== "waiting") {
    const customer = document.querySelector(`.customer[data-id="${dataID}"]`);
    customer.remove();
  }
};

// * Remove New Order
const removeNewOrder = (dataID) => {
  const customer = document.querySelector(`.customer[data-id="${dataID}"]`);
  customer.remove();
};

// Adds 0 when value is < 10
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

/**
 ** ****************************************************************************
 **
 ** wait_driver.html
 **
 ** ****************************************************************************
 */

// * Render Waiting Order
const renderWaitingOrder = (data, dataID) => {
  // const errorReq = document.querySelector(".error-req");
  const success = document.querySelector(".success");
  const waiting = document.querySelector(".waiting");

  const ordStatus = data.status;

  if (ordStatus === "transac") {
    // errorReq.style.display = "none";
    success.style.display = " block";
    waiting.style.display = "none";

    window.location.href = "/pages/check_price_list.html";
  } else if (ordStatus === "waiting") {
    // errorReq.style.display = "none";
    success.style.display = "none";
    waiting.style.display = "block";
  }
  // else {
  //   errorReq.style.display = "block";
  //   success.style.display = "none";
  //   waiting.style.display = "none";
  // }
};

/**
 ** ****************************************************************************
 **
 ** order.html
 **
 ** ****************************************************************************
 */

// * Change Weight Price Value
const changeWeightPriceValue = () => {
  const weightModal = document.querySelector("#weight_modal");
  const weightForm = weightModal.querySelector("#weight-form");
  // const weightRange = weightForm.querySelector("#weight-range");
  // const weightValue = weightForm.querySelector(".weight-value");
  // const weightEstimateFee = weightForm.querySelector(".estimate-fee");
  // const weightVal = weightRange.value.trim();

  // weightValue.innerHTML = weightVal;

  // if (weightVal >= 0 && weightVal <= 5) {
  //   weightEstimateFee.innerHTML = "80.00";
  // } else if (weightVal === 6) {
  //   weightEstimateFee.innerHTML = "175.00";
  // } else {
  //   weightEstimateFee.innerHTML = "175.00";

  //   const weight = weightVal > 6 ? weightVal - 6 : 6 - weightVal;

  //   const addPrice = parseInt(weight) * 25;

  //   if (addPrice !== 1) {
  //     const fee = parseInt(weightEstimateFee.textContent);
  //     const addedFee = fee + addPrice;
  //     weightEstimateFee.innerHTML = addedFee.toFixed(2);
  //   }
  // }
};

// * Show add modal price & store limit
const showPriceStoreLimit = () => {
  const addForm = document.querySelector("#add-item-form");

  db.collection("getmoco_settings")
    .where("settings", "==", "ALL")
    .get()
    .then((snap) => {
      snap.forEach((doc) => {
        const priceLimit = doc.data().priceLimit;

        addForm.querySelector(".price-limit").innerHTML = priceLimit;
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};

// * Remove Order Item
const removeOrderItem = (dataID) => {
  const item = document.querySelector(`.item[data-id="${dataID}"]`);
  item.remove();
};

// * Update Order Item
const updateOrderItem = (data, dataID) => {
  const item = document.querySelector(`.item[data-id="${dataID}"]`);
  item.querySelector(".product").innerHTML = data.product;
  item.querySelector(".store").innerHTML =
    data.store !== "None" ? data.store : "<em>None</em>";
  item.querySelector(".productDesc").innerHTML =
    data.productDesc !== "None" ? data.productDesc : "<em>None</em>";
  item.querySelector(".unit").innerHTML = data.unit;
  item.querySelector(".measurement").innerHTML = data.measurement;
  item.querySelector(".quantity").innerHTML = data.quantity;
  item.querySelector(".note").innerHTML =
    data.note !== "None" ? data.note : "<em>None</em>";
};

// * Render Order Item
const renderOrderItem = (data, dataID) => {
  const orderItems = document.querySelector(".order-items");

  const html = `
        <li class="item" data-id="${dataID}">
          <div class="collapsible-header">
            <i class="material-icons">local_mall</i>
            <strong class="product">${data.product}</strong>
          </div>
          <div class="collapsible-body grey lighten-2">
            <h6><strong>Store Name (Optional)</strong></h6>
            <p class="store">
              ${data.store !== "None" ? data.store : "<em>None</em>"}
            </p>
            <h6><strong>Product Description (Optional)</strong></h6>
            <p class="productDesc">
              ${
                data.productDesc !== "None" ? data.productDesc : "<em>None</em>"
              }
            </p>
            <h6><strong>Unit Measurement</strong></h6>
            <p>
              <span class="unit">${data.unit}</span>
              <span class="measurement">${data.measurement}</span>
            </p>
            <h6><strong>Quantity</strong></h6>
            <p class="quantity">${data.quantity}</p>
            <h6><strong>Note (Optional)</strong></h6>
            <p class="note">
              ${data.note !== "None" ? data.note : "<em>None</em>"}
            </p>
            <div class="center-align" data-id="${dataID}">
              <i
                class="material-icons modal-trigger tooltipped edit"
                href="#edit_item_modal"
                style="cursor: pointer"
                data-position="top"
                data-tooltip="Edit Item"
                title="Edit Item"
              >
                edit
              </i>
              <i
                class="material-icons tooltipped delete"
                style="cursor: pointer"
                data-position="top"
                data-tooltip="Delete Item"
                title="Delete Item"
              >
                delete_outline
              </i>
            </div>
          </div>
        </li>
      `;

  orderItems.innerHTML += html;
};

// * Remove Sample Item
const removeSampleItem = () => {
  const next = document.querySelector(".next-back-customer");
  next.style.display = "block";

  const sampleItem = document.querySelectorAll(".sample-item");
  sampleItem.forEach((item) => (item.style.display = "none"));
};

// * Render Sample Item
const renderSampleItem = () => {
  const next = document.querySelector(".next-back-customer");
  next.style.display = "none";

  const orderItems = document.querySelector(".order-items");
  orderItems.innerHTML = `
    <li class="sample-item">
      <div class="collapsible-header">
        <i class="material-icons">local_mall</i>
        <strong>Example <em>(List New Item to Continue)</em></strong>
      </div>
      <div class="collapsible-body grey lighten-2">
        <h6><strong>Store Name (Optional)</strong></h6>
        <p><em>Example Store</em></p>
        <h6><strong>Product Description (Optional)</strong></h6>
        <p><em>Example Description</em></p>
        <h6><strong>Unit Measurement</strong></h6>
        <p><em>500 ml</em></p>
        <h6><strong>Quantity</strong></h6>
        <p><em>5</em></p>
        <h6><strong>Note (Optional)</strong></h6>
        <p><em>Example Note</em></p>
        <div class="center-align">
          <i
            class="material-icons tooltipped"
            style="cursor: pointer"
            data-position="top"
            data-tooltip="Edit Item"
            title="Edit Item"
          >
            edit
          </i>
          <i
            class="material-icons tooltipped"
            style="cursor: pointer"
            data-position="top"
            data-tooltip="Delete Item"
            title="Delete Item"
          >
            delete_outline
          </i>
        </div>
      </div>
    </li>
  `;
};

// * Setup Location Place Address
const setupLocPlaceAdd = (customerID) => {
  const addressOrg = document.querySelector(".addressOrg");
  const landmarkOrg = document.querySelector(".landmarkOrg");
  const addressDrp = document.querySelector(".addressDrp");
  const landmarkDrp = document.querySelector(".landmarkDrp");
  const totalDistance = document.querySelector(".totalDistance");
  const serviceFee = document.querySelector(".serviceFee");

  db.collection("getmoco_orders")
    .where("status", "in", ["current"])
    .where("customerID", "==", customerID)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());

        addressOrg.innerHTML = doc.data().addressOrg;
        landmarkOrg.innerHTML =
          doc.data().landmarkOrg === ""
            ? "<em>None</em>"
            : doc.data().landmarkOrg;

        addressDrp.innerHTML = doc.data().addressDrp;
        landmarkDrp.innerHTML =
          doc.data().landmarkDrp === ""
            ? "<em>None</em>"
            : doc.data().landmarkDrp;

        totalDistance.innerHTML = doc.data().totalDistance;
        serviceFee.innerHTML = parseFloat(doc.data().serviceFee).toFixed(2);
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};

/**
 ** ****************************************************************************
 **
 ** index.html
 **
 ** ****************************************************************************
 */

// * Setup user type choice
const setupUserTypeChoice = () => {
  const userTypeChoice = document.querySelector('input[name="type"]:checked');
  const driverInput = document.querySelector(".driver-input");
  const drvLicense = document.querySelector(".driver-input #drvLicense");
  const drvPlate = document.querySelector(".driver-input #drvPlate");

  if (userTypeChoice.value === "driver") {
    drvLicense.value = "";
    drvLicense.className = "validate";
    drvLicense.required = true;

    drvPlate.value = "";
    drvPlate.className = "validate";
    drvPlate.required = true;

    driverInput.style.display = "block";
  } else {
    drvLicense.value = "";
    drvLicense.className = "validate";
    drvLicense.required = false;

    drvPlate.value = "";
    drvPlate.className = "validate";
    drvPlate.required = false;

    driverInput.style.display = "none";
  }
};

/**
 ** ****************************************************************************
 **
 ** home.html / driver.html
 **
 ** ****************************************************************************
 */

// * Use Current Address
const useCurrentAddress = (userID) => {
  const pinLocForm = document.querySelector("#pin-location-form");

  const townDrpC = pinLocForm.querySelector(
    `.dropoff-container div[data-id="${settingsLoc}"] select`
  );
  const streetDrpC = pinLocForm.querySelector("#streetDrp");
  const houseDrpC = pinLocForm.querySelector("#houseDrp");
  const landmarkDrpC = pinLocForm.querySelector("#landmarkDrp");

  const useCurrent = pinLocForm.useCurrent.checked;

  if (useCurrent) {
    if (townDrpC) {
      townDrpC.disabled = true;
      townDrpC.value = "";
    }
    streetDrpC.disabled = true;
    houseDrpC.disabled = true;
    landmarkDrpC.disabled = true;
    streetDrpC.value = "";
    houseDrpC.value = "";
    landmarkDrpC.value = "";

    db.collection("getmoco_users")
      .doc(userID)
      .get()
      .then((doc) => {
        brgyDrp = doc.data().brgy;
        zipDrp = doc.data().zip;
        streetDrp = doc.data().street;
        houseDrp = doc.data().house;
        landmarkDrp = doc.data().landmark;
        dmDestination = doc.data().dmDestination;
      });
  } else {
    if (townDrpC) {
      townDrpC.disabled = false;
      townDrpC.value = "";
    }
    streetDrpC.disabled = false;
    houseDrpC.disabled = false;
    landmarkDrpC.disabled = false;
    streetDrpC.value = "";
    houseDrpC.value = "";
    landmarkDrpC.value = "";

    brgyDrp = "";
    zipDrp = "";
    streetDrp = "";
    houseDrp = "";
    landmarkDrp = "";
    dmDestination = "";
  }
};

// * Render User Verified
const renderUserVerified = (data, dataID, type) => {
  const pinLocForm = document.querySelector("#pin-location-form");
  const pinLocButton = pinLocForm.querySelector(".pin-loc-button");
  const errorField = pinLocForm.querySelector(".error");

  const verifyStatus = data.verified;

  if (type === "user") {
    const townOrg = pinLocForm.querySelector(
      `.origin-container div[data-id="${settingsLoc}"] select`
    );
    const streetOrg = pinLocForm.querySelector("#streetOrg");
    const houseOrg = pinLocForm.querySelector("#houseOrg");
    const landmarkOrg = pinLocForm.querySelector("#landmarkOrg");

    const townDrp = pinLocForm.querySelector(
      `.dropoff-container div[data-id="${settingsLoc}"] select`
    );
    const streetDrp = pinLocForm.querySelector("#streetDrp");
    const houseDrp = pinLocForm.querySelector("#houseDrp");
    const landmarkDrp = pinLocForm.querySelector("#landmarkDrp");

    errorField.innerHTML = "";
    pinLocForm.reset();

    if (verifyStatus === "verified" && townOrg && townDrp) {
      pinLocButton.disabled = false;

      townOrg.disabled = false;
      streetOrg.disabled = false;
      houseOrg.disabled = false;
      landmarkOrg.disabled = false;

      townDrp.disabled = false;
      streetDrp.disabled = false;
      houseDrp.disabled = false;
      landmarkDrp.disabled = false;
    } else {
      pinLocButton.disabled = true;

      // townOrg.disabled = true;
      streetOrg.disabled = true;
      houseOrg.disabled = true;
      landmarkOrg.disabled = true;

      // townDrp.disabled = true;
      streetDrp.disabled = true;
      houseDrp.disabled = true;
      landmarkDrp.disabled = true;

      if (verifyStatus !== "verified") {
        errorField.innerHTML =
          "<blockquote><strong>Please verify your account first in profile page.</strong></blockquote>";
      } else {
        errorField.innerHTML =
          "<blockquote><strong>Location is not yet available.</strong></blockquote>";
      }
    }
  } else {
    errorField.innerHTML = "";

    if (verifyStatus === "verified" && settingsLoc.trim() !== ",") {
      pinLocButton.disabled = false;
    } else {
      pinLocButton.disabled = true;

      if (verifyStatus !== "verified") {
        errorField.innerHTML =
          "<blockquote><strong>Please verify your account first in profile page.</strong></blockquote>";
      } else {
        errorField.innerHTML =
          "<blockquote><strong>Location is not yet available.</strong></blockquote>";
      }
    }
  }
};
