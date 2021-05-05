

const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || shimIndexedDB || msIndexedDB;

let db;
const request = indexedDB.open("budget", 1)

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true })
}

request.onsuccess = ({ target }) => {
  let db = target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
}

// onerror handler console log "There was and error"
request.onerror = function (event) {
  console.log("There was an error " + event.target.errorCode);
};


function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

function useIndexedDB() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      }).then(response => {
        return response.json()
      }).then(() => {
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
      })
    }
  }

}

window.addEventListener("online", useIndexedDb)