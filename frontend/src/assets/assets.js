import appointment_img from './appointment_img.png';
import header_img from './header_img.png';
import group_profiles from './group_profiles.png';
import profile_pic from './profile_pic.png';
import contact_image from './contact_image.png';
import about_image from './about_image.png';
import logo from './logo.svg';
import dropdown_icon from './dropdown_icon.svg';
import menu_icon from './menu_icon.svg';
import cross_icon from './cross_icon.png';
import chats_icon from './chats_icon.svg';
import verified_icon from './verified_icon.svg';
import arrow_icon from './arrow_icon.svg';
import info_icon from './info_icon.svg';
import upload_icon from './upload_icon.png';
import stripe_logo from './stripe_logo.png';
import razorpay_logo from './razorpay_logo.png';
import doc1 from './doc1.png';
import doc2 from './doc2.png';
import doc3 from './doc3.png';
import doc4 from './doc4.png';
import doc5 from './doc5.png';
import doc6 from './doc6.png';
import doc7 from './doc7.png';
import doc8 from './doc8.png';
import doc9 from './doc9.png';
import doc10 from './doc10.png';
import doc11 from './doc11.png';
import doc12 from './doc12.png';
import doc13 from './doc13.png';
import doc14 from './doc14.png';
import doc15 from './doc15.png';
import Dermatologist from './Dermatologist.svg';
import Gastroenterologist from './Gastroenterologist.svg';
import General_physician from './General_physician.svg';
import Gynecologist from './Gynecologist.svg';
import Neurologist from './Neurologist.svg';
import Pediatricians from './Pediatricians.svg';


export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
    razorpay_logo
};

export const specialityData = [
    {
        speciality: 'General physician',
        image: General_physician
    },
    {
        speciality: 'Gynecologist',
        image: Gynecologist
    },
    {
        speciality: 'Dermatologist',
        image: Dermatologist
    },
    {
        speciality: 'Pediatricians',
        image: Pediatricians
    },
    {
        speciality: 'Neurologist',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterologist',
        image: Gastroenterologist
    },
];

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: doc1,
        speciality: 'General physician',
        degree: 'MBBS, MD',
        experience: '4 Years',
        about: 'Dr. Richard James is a dedicated General Physician with a focus on holistic patient care and preventive medicine. He is known for his thorough diagnostic approach.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Monday": [{ time: "09:00 AM", available: true }, { time: "10:00 AM", available: true }, { time: "11:00 AM", available: false }],
            "Wednesday": [{ time: "09:00 AM", available: true }, { time: "10:00 AM", available: true }],
            "Friday": [{ time: "09:00 AM", available: true }, { time: "10:00 AM", available: true }, { time: "11:00 AM", available: true }]
        }
    },
    {
        _id: 'doc2',
        name: 'Dr. Emily Larson',
        image: doc2,
        speciality: 'Gynecologist',
        degree: 'MBBS, DGO',
        experience: '3 Years',
        about: 'Dr. Emily Larson specializes in women\'s health, providing compassionate and comprehensive gynecological care. She is an advocate for patient education and empowerment.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Tuesday": [{ time: "10:30 AM", available: true }, { time: "11:30 AM", available: true }, { time: "01:30 PM", available: true }],
            "Thursday": [{ time: "10:30 AM", available: true }, { time: "11:30 AM", available: false }, { time: "01:30 PM", available: true }]
        }
    },
    {
        _id: 'doc3',
        name: 'Dr. Sarah Patel',
        image: doc3,
        speciality: 'Dermatologist',
        degree: 'MBBS, DDVL',
        experience: '1 Year',
        about: 'Dr. Sarah Patel is an emerging dermatologist with expertise in clinical and cosmetic dermatology. She is committed to providing the latest treatments for skin health.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Monday": [{ time: "09:30 AM", available: true }, { time: "10:30 AM", available: false }],
            "Wednesday": [{ time: "11:30 AM", available: true }],
            "Friday": [{ time: "10:00 AM", available: true }]
        }
    },
    {
        _id: 'doc4',
        name: 'Dr. Christopher Lee',
        image: doc4,
        speciality: 'Pediatricians',
        degree: 'MBBS, DCH',
        experience: '2 Years',
        about: 'Dr. Christopher Lee is a caring pediatrician dedicated to the health and well-being of children. He has a friendly approach that makes young patients feel comfortable.',
        fees: 40,
        address: {
            line1: '47th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Monday": [{ time: "02:00 PM", available: true }, { time: "03:00 PM", available: true }],
            "Tuesday": [{ time: "02:00 PM", available: true }, { time: "03:00 PM", available: true }],
            "Thursday": [{ time: "04:00 PM", available: true }]
        }
    },
    {
        _id: 'doc5',
        name: 'Dr. Jennifer Garcia',
        image: doc5,
        speciality: 'Neurologist',
        degree: 'MBBS, DM',
        experience: '4 Years',
        about: 'Dr. Jennifer Garcia is a neurologist with a keen interest in treating complex neurological disorders. She believes in a patient-centric approach to care.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Tuesday": [{ time: "11:00 AM", available: true }, { time: "12:00 PM", available: false }],
            "Friday": [{ time: "02:00 PM", available: true }]
        }
    },
    {
        _id: 'doc6',
        name: 'Dr. Andrew Williams',
        image: doc6,
        speciality: 'Neurologist',
        degree: 'MBBS, DNB',
        experience: '4 Years',
        about: 'Dr. Andrew Williams offers expert care for a wide range of neurological conditions. He is passionate about advancing brain health through research and practice.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Monday": [{ time: "09:00 AM", available: true }],
            "Wednesday": [{ time: "10:00 AM", available: true }],
            "Friday": [{ time: "11:00 AM", available: true }]
        }
    },
    {
        _id: 'doc7',
        name: 'Dr. Christopher Davis',
        image: doc7,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Christopher Davis provides comprehensive primary care for adults. He focuses on building long-term relationships with his patients to manage their health effectively.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Tuesday": [{ time: "03:00 PM", available: true }, { time: "04:00 PM", available: false }],
            "Thursday": [{ time: "05:00 PM", available: true }]
        }
    },
    {
        _id: 'doc8',
        name: 'Dr. Timothy White',
        image: doc8,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Timothy White is a trusted gynecologist known for his gentle and respectful care. He provides a full spectrum of services for women of all ages.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Monday": [{ time: "10:00 AM", available: true }, { time: "11:00 AM", available: true }],
            "Wednesday": [{ time: "12:00 PM", available: true }]
        }
    },
    {
        _id: 'doc9',
        name: 'Dr. Ava Mitchell',
        image: doc9,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Year',
        about: 'Dr. Ava Mitchell focuses on medical dermatology, helping patients manage conditions like acne, eczema, and psoriasis with personalized treatment plans.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Tuesday": [{ time: "09:00 AM", available: false }],
            "Thursday": [{ time: "10:00 AM", available: true }, { time: "11:00 AM", available: true }]
        }
    },
    {
        _id: 'doc10',
        name: 'Dr. Jeffrey King',
        image: doc10,
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Jeffrey King is committed to providing excellent pediatric care, from routine check-ups to managing complex childhood illnesses. Parents trust his expertise.',
        fees: 40,
        address: {
            line1: '47th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Monday": [{ time: "09:00 AM", available: true }],
            "Tuesday": [{ time: "10:00 AM", available: true }],
            "Wednesday": [{ time: "11:00 AM", available: true }],
            "Thursday": [{ time: "12:00 PM", available: true }]
        }
    },
    {
        _id: 'doc11',
        name: 'Dr. Zoe Kelly',
        image: doc11,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Zoe Kelly is a skilled neurologist who diagnoses and treats disorders of the nervous system. Her compassionate approach is valued by her patients.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Monday": [{ time: "01:00 PM", available: true }],
            "Wednesday": [{ time: "02:00 PM", available: true }, { time: "03:00 PM", available: false }]
        }
    },
    {
        _id: 'doc12',
        name: 'Dr. Patrick Harris',
        image: doc12,
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Patrick Harris combines clinical expertise with a deep commitment to patient well-being, offering advanced care for conditions like epilepsy and stroke.',
        fees: 50,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Tuesday": [{ time: "09:30 AM", available: true }],
            "Thursday": [{ time: "10:30 AM", available: true }, { time: "11:30 AM", available: true }]
        }
    },
    {
        _id: 'doc13',
        name: 'Dr. Chloe Evans',
        image: doc13,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Chloe Evans is a reliable general physician who excels in diagnosing and managing a wide variety of medical conditions in a primary care setting.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Monday": [{ time: "09:00 AM", available: true }],
            "Tuesday": [{ time: "10:00 AM", available: false }],
            "Friday": [{ time: "11:00 AM", available: true }]
        }
    },
    {
        _id: 'doc14',
        name: 'Dr. Ryan Martinez',
        image: doc14,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Ryan Martinez is dedicated to providing high-quality care in obstetrics and gynecology, with a focus on patient safety and positive outcomes.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Monday": [{ time: "02:30 PM", available: true }],
            "Wednesday": [{ time: "03:30 PM", available: true }],
            "Friday": [{ time: "04:30 PM", available: true }]
        }
    },
    {
        _id: 'doc15',
        name: 'Dr. Amelia Hill',
        image: doc15,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Year',
        about: 'Dr. Amelia Hill offers a fresh perspective in dermatology, focusing on evidence-based treatments for both common and rare skin disorders.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        },
        schedule: {
            "Tuesday": [{ time: "10:00 AM", available: true }],
            "Thursday": [{ time: "11:00 AM", available: true }, { time: "12:00 PM", available: false }]
        }
    },
];