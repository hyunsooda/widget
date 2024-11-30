async function testAPI() {
  try {
    let r = await fetch('http://localhost:3000/api/weather')
    console.log(r)
    r = await fetch('http://localhost:3000/api/crypto')
    console.log(r)
    r = await fetch('http://localhost:3000/api/stock')
    console.log(r)
    r = await fetch('http://localhost:3000/api/exchangerate')
    console.log(r)
  } catch (error) {
    console.error('Error testing weather API:', error)
  }
}

testAPI()

