// import add_icon from './add_icon.svg'
// import admin_logo from './admin_logo.svg'
// import appointment_icon from './appointment_icon.svg'
// import cancel_icon from './cancel_icon.svg'
// import doctor_icon from './doctor_icon.svg'
// import home_icon from './home_icon.svg'
// import people_icon from './people_icon.svg'
// import upload_area from './upload_area.svg'
// import list_icon from './list_icon.svg'
// import tick_icon from './tick_icon.svg'
// import appointments_icon from './appointments_icon.svg'
// import earning_icon from './earning_icon.svg'
// import patients_icon from './patients_icon.svg'
// import logo from './sonia1.mp4'
// import logo2 from './sonia2.png'
// import logo3 from './sonia.mp4'
// import logo4 from './logo2.mp4'
// import logo5 from './sonia4.mp4'
// import logo6 from './sonia5.mp4'
// import advert from './ad1.jpg'
// import advert2 from './ad2.jpg'
// import advert3 from './ad3.jpg'
// import advert4 from './ad4.jpg'
// import advert5 from './ad5.jpg'
// import advert6 from './ad6.jpg'
// import vid1 from './video1.mp4'
// import vid2 from './video2.mp4'
// import vid3 from './video3.mp4'
// import vid4 from './video4.mp4'
// import vid5 from './video5.mp4'


// export const assets = {
//     add_icon,
//     admin_logo,
//     appointment_icon,
//     cancel_icon,
//     doctor_icon,
//     upload_area,
//     home_icon,
//     patients_icon,
//     people_icon,
//     list_icon,
//     tick_icon,
//     appointments_icon,
//     earning_icon,
//     logo,
//     logo2,
//     logo3,
//     logo4,
//     logo5,
//     logo6,
//     advert,
//     advert2,
//     advert3,
//     advert4,
//     advert5,
//     advert6,
//     vid1,
//     vid2,
//     vid3,
//     vid4,
//     vid5
// }


// Define Cloudinary URL prefix with your cloud name
const CLOUDINARY_URL = "https://res.cloudinary.com/dmefsl3py";

// Keep SVG imports
import add_icon from './add_icon.svg'
import admin_logo from './admin_logo.svg'
import appointment_icon from './appointment_icon.svg'
import cancel_icon from './cancel_icon.svg'
import doctor_icon from './doctor_icon.svg'
import home_icon from './home_icon.svg'
import people_icon from './people_icon.svg'
import upload_area from './upload_area.svg'
import list_icon from './list_icon.svg'
import tick_icon from './tick_icon.svg'
import appointments_icon from './appointments_icon.svg'
import earning_icon from './earning_icon.svg'
import patients_icon from './patients_icon.svg'

// Cloudinary assets organized by type
const cloudinaryAssets = {
    // Videos
    vid1: `${CLOUDINARY_URL}/video/upload/v1/video1_wu5oqw`,
    vid2: `${CLOUDINARY_URL}/video/upload/v1/video2_kylp9h`,
    vid3: `${CLOUDINARY_URL}/video/upload/v1/video3_ktznh8`,
    vid4: `${CLOUDINARY_URL}/video/upload/v1/video4_zphubp`,
    vid5: `${CLOUDINARY_URL}/video/upload/v1/video5_xqqtpd`,
    
    // Logos and brand videos
    logo: `${CLOUDINARY_URL}/video/upload/v1/sonia1_xewtzw`,
    logo2: `${CLOUDINARY_URL}/image/upload/v1/sonia2_axpkqc`,
    logo3: `${CLOUDINARY_URL}/video/upload/v1/sonia_xef7ev`,
    logo4: `${CLOUDINARY_URL}/video/upload/v1/logo2_xsnnvm`,
    logo5: `${CLOUDINARY_URL}/video/upload/v1/sonia4_ws6ngp`,
    logo6: `${CLOUDINARY_URL}/video/upload/v1/sonia5_azre75`,
    
    // Main logo
    LOGO1: `${CLOUDINARY_URL}/image/upload/v1/LOGO1_yaoz5u`,
    
    // Advertisements
    advert: `${CLOUDINARY_URL}/image/upload/v1/ad1_ptg17a`,
    advert3: `${CLOUDINARY_URL}/image/upload/v1/ad3_friicc`,
    advert4: `${CLOUDINARY_URL}/image/upload/v1/ad4_btxwqc`,
    advert5: `${CLOUDINARY_URL}/image/upload/v1/ad5_nbkrtg`,
    advert6: `${CLOUDINARY_URL}/image/upload/v1/ad6_lxcuv8`,
}

export const assets = {
    // SVG icons
    add_icon,
    admin_logo,
    appointment_icon,
    cancel_icon,
    doctor_icon,
    upload_area,
    home_icon,
    patients_icon,
    people_icon,
    list_icon,
    tick_icon,
    appointments_icon,
    earning_icon,
    
    // Cloudinary assets
    ...cloudinaryAssets
}