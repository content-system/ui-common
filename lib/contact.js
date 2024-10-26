"use strict"
function submitContact(e) {
  e.preventDefault()
  const target = e.target
  const form = target.form
  const contact = decodeFromForm(form)
  const url = getCurrentURL()
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  })
    .then((response) => {
      if (response.ok) {
        response.text().then((data) => {
          console.log("Success:", data)
          alert("Data submitted successfully!")
        })
      } else {
        console.error("Error:", response.statusText)
        alert("Failed to submit data.")
      }
    })
    .catch((err) => {
      console.log("Error: " + err)
      alert("An error occurred while submitting the form")
    })
}
