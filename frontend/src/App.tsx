import { BrowserRouter, Routes, Route } from 'react-router'

function Home() {
  return <h1>BidAppetit</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
