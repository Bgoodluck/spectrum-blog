import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Dashboard from './pages/Dashboard.jsx/Dashboard'
import SignUp from './pages/Authentication/SignUp'
import SignIn from './pages/Authentication/SignIn'
import Adverts from './pages/Adverts/Adverts'
import Header from './components/Header/Header'
import FooterComp from './components/Footer/FooterComp'
import PrivateRoute from './components/Private/PrivateRoute'
import OnlyAdminPrivateRoute from './components/Private/OnlyAdminPrivateRoute'
import CreatePost from './pages/Operations/CreatePost'
import UpdatePost from './pages/Operations/UpdatePost'
import PostPage from './pages/Operations/PostPage'
import VipRoute from './components/Private/VipRoute'
import AdvertForm from './pages/Operations/AdvertForm'
import AdvertList from './components/Sidebar/AdvertList'
import UpdateAdvert from './pages/Operations/UpdateAdvert'
import ScrollToTop from './components/Accessories/ScrollToTop'
import Search from './pages/Operations/Search'
import AdvertManagement from './pages/Adverts/AdvertManagement'
import VIPUpgrade from './pages/Payment/VIPUpgrade'
import VIPPaymentVerification from './pages/Payment/VIPPaymentVerification'
import AdvertSubscribe from './pages/Adverts/AdvertSubscribe'
// import AdminSkitManager from './pages/Skits/AdminSkitManager'
import SkitGallery from './pages/Skits/SkitGallery'
import WixStyleLanding from './components/Accessories/WixStyleLanding'
import EntertainmentPosts from './pages/Operations/EntertainmentPosts'
import VideoSDK from './components/Accessories/VideoSDK'

function App() {
  return (
    <BrowserRouter >
    <ScrollToTop/>
    <Header/>
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
        <Route path="/skit-gallery" element={<SkitGallery />} />
        <Route path="/advert-sub" element={<AdvertSubscribe />} />
        <Route path="/wix" element={<WixStyleLanding />} />
        <Route path="/catego" element={<EntertainmentPosts />} />
        <Route path="/vip-upgrade" element={<VIPUpgrade />} />
        <Route path="/verify-vip-payment" element={<VIPPaymentVerification />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/adverts" element={<Adverts />} />
        <Route path="/advert-page" element={<AdvertList />} />
        <Route path="/post/:postSlug" element={<PostPage />} />
        <Route 
    path="/live-stream" 
    element={<VideoSDK initialMode="viewer" />} 
  />




        

        <Route element={<PrivateRoute/>}>
        <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<VipRoute/>}>
        <Route path="/advert" element={<AdvertForm />} />
        <Route path="/update-advert" element={<UpdateAdvert />} />
        <Route 
      path="/create-stream" 
      element={<VideoSDK initialMode="host" />} 
    />
        </Route>

        <Route element={<OnlyAdminPrivateRoute/>}>
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/update-post/:postId" element={<UpdatePost />} />
        <Route path="/star-advert" element={<AdvertManagement />} />
        {/* <Route path="/skit-admin" element={<AdminSkitManager />} /> */}
        </Route>
        
        
     </Routes>
       <FooterComp/>
    </BrowserRouter>
  )
}

export default App