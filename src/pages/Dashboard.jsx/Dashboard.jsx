import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import DashSidebar from '../../components/Sidebar/DashSidebar'
import DashProfile from '../../components/Sidebar/DashProfile'
import DashPosts from '../../components/Sidebar/DashPosts'
import DashUsers from '../../components/Sidebar/DashUsers'
import AdvertList from '../../components/Sidebar/AdvertList'
import UpdateAdvert from '../Operations/UpdateAdvert'
import DashComments from '../../components/Sidebar/DashComments'
import DashCrud from '../../components/Sidebar/DashCrud'
import DashboardView from './DashboardView'
import AdvertManagement from '../Adverts/AdvertManagement'
import AdminSkitManager from '../Skits/AdminSkitManager'
import ContentCreatorSkit from '../Skits/ContentCreatorSkit'

function Dashboard() {

  const location = useLocation()
  const [tab, setTab] = useState('')



  useEffect(()=>{
    const urlParams = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get('tab')
    if(tabFromUrl){
      setTab(tabFromUrl)
    }
    
  },[location.search])

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
        <div className='md:w-56'>
          {/* sidebar */}
          <DashSidebar/>
        </div>
         {/* dashbord view */}
         {
           tab === 'admin-panel' && <DashboardView/>
         }
         {/* profile */}
         {
           tab === 'profile' && <DashProfile/>
          //  I CAN ADD AS MANY TABS AS I WANT          
         }
         {/* posts */}
         {
           tab === 'posts' && <DashPosts/>          
         }
         {/* users */}
         {
           tab === 'users' && <DashUsers/>          
         }
         {/* advertisment */}
         {
           tab === 'advert-page' && <AdvertList/>          
         }
         {
           tab === 'update-advert' && <UpdateAdvert/>          
         }
         {/* skits content creators */}
         {
           tab === 'skit-creators' && <ContentCreatorSkit/>          
         }
         {/* comments */}
         {
           tab === 'comments' && <DashComments/>          
         }
         {/* admin strict control */}
         {
           tab === 'crud' && <DashCrud/>          
         }
         {
           tab === 'star-advert' && <AdvertManagement/>          
         }
         {
           tab === 'skit-admin' && <AdminSkitManager/>          
         }
    </div>
  )
}

export default Dashboard