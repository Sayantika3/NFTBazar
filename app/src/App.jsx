import { useState } from 'react'
import Home from './pages/home'
import List from './pages/list'
import Create from './pages/create'
import MyPurchase from './pages/mypurchase'
import Navbar from './components/nav'
import { BrowserRouter,Route,Routes } from 'react-router-dom'

import './App.css'


function App() {
 
 

  return (
<BrowserRouter>
      <Routes>
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/list" element={<><Navbar /><List /></>} />
        <Route path="/create" element={<><Navbar /><Create /></>} />
        <Route path="/mypurchase" element={<><Navbar /><MyPurchase /></>} />
        

        
      
      </Routes>
    </BrowserRouter>
  )
}

export default App
