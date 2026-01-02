(() => {
  'use strict'

  async function geoVerify(location, country) {
    const verifyCountry = await axios.get(`https://nominatim.openstreetmap.org/search?country=${country.value}&format=json`)//structured query
    if(verifyCountry.data.length == 0){
      country.setCustomValidity("Please enter a valid country name")
    }else{
      country.setCustomValidity("")
      const verifyLocation = await axios.get(`https://nominatim.openstreetmap.org/search?q=${location.value+", "+country.value}&format=json`)//free-form query
      if(verifyLocation.data.length == 0){
          location.setCustomValidity("Please enter a valid location")
      }else{
          location.setCustomValidity("")
      }
    }
  }

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', async(event) => {
      event.preventDefault()

      const location = document.getElementById('location')
      const country = document.getElementById('country')
      if(location && country){
        await geoVerify(location,country)
      }

      form.classList.add('was-validated')

      if (!form.checkValidity()) {
        event.stopPropagation()
        return
      }

      form.submit()
    }, false)
  })
})()