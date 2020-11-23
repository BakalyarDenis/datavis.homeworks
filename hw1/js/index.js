const checkbox = document.querySelector("input")
var label = document.querySelector("label")
var path = document.querySelector("path")

checkbox.onchange = () => {
  if (checkbox.checked){
    label.innerHTML = 'Happy'
    path.setAttribute("d", "M 150 200 Q 225 300 300 200")
  } else {
    label.innerHTML = 'Sad'
    path.setAttribute("d", "M 150 200 Q 225 100 300 200")
  }
}
