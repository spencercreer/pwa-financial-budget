let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || shimIndexedDB || msIndexedDB;

let db;
let request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true })
}

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    useIndexedDb();
  }
}

// onerror handler console log "There was and error"
request.onerror = function (event) {
  console.log("There was an error " + event.target.errorCode);
}


function saveRecord(record) {
  let transaction = db.transaction(["pending"], "readwrite");
  let store = transaction.objectStore("pending");
  store.add(record);
}

function useIndexedDb() {
  let transaction = db.transaction(["pending"], "readwrite");
  let store = transaction.objectStore("pending");
  let getAllRequest = store.getAll();
  getAllRequest.onsuccess = function () {
    if (getAllRequest.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAllRequest.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        return response.json()
      }).then(() => {
        let transaction = db.transaction(["pending"], "readwrite");
        let store = transaction.objectStore("pending");
        store.clear();
      })
    }
  }

}

window.addEventListener("online", useIndexedDb);