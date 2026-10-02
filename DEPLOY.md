# 🩸 BloodBridge Cloud Server - Deployment & Setup Guide

এই সার্ভারটি BloodBridge অ্যাপের জন্য একটি হাই-স্পিড (Sub-10ms), রিয়েল-টাইম ক্লাউড ব্যাকএন্ড সার্ভার। এটি সারাদেশে যে কোনো জেলা/উপজেলা থেকে সেকেন্ডের মধ্যে রক্তের জরুরী রিকোয়েস্ট আদান-প্রদান করতে সক্ষম।

---

## ১. ফ্রি ক্লাউড হোস্টিংয়ে ডেপ্লয় করার নিয়ম (Render.com - 100% Free 24/7):

১. [Render.com](https://render.com) এ গিয়ে একটি ফ্রি অ্যাকাউন্ট খুলুন (GitHub দিয়ে সরাসরি সাইন ইন করতে পারেন)।
২. আপনার GitHub অ্যাকাউন্টে একটি নতুন রিপোজিটরি (New Repository) তৈরি করুন (নাম দিতে পারেন `bloodbridge-server`) এবং এই ফোল্ডারের ফাইলগুলো আপলোড/পুশ করুন।
৩. Render ড্যাশবোর্ডে গিয়ে **"New +" -> "Web Service"** সিলেক্ট করুন।
৪. আপনার GitHub রিপোজিটরি সিলেক্ট করুন।
৫. সেটিংস দিন:
   - **Name:** `bloodbridge-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
৬. **"Deploy Web Service"** বাটনে ক্লিক করুন।
৭. এক মিনিটের মধ্যে আপনার লাইভ সার্ভার রেডি হয়ে যাবে এবং আপনি একটি ফ্রি HTTPS লাইভ URL পেয়ে যাবেন (যেমন: `https://bloodbridge-api.onrender.com`)।

---

## ২. Android অ্যাপে সার্ভার URL যুক্ত করার গোপন নিয়ম (Developer Mode):

সাধারণ ইউজাররা যাতে কোনো সেটিংস নষ্ট করতে না পারে, সেজন্য সার্ভার কনফিগারেশন সাধারণ সেটিংস থেকে সরিয়ে **সিকিউর ডেভেলপার মোডে** রাখা হয়েছে:

১. BloodBridge অ্যাপ ওপেন করুন।
২. উপরের হেডারে যেখানে লেখা **"BloodBridge"** বা **"ব্লাডব্রিজ"**, সেখানে **৩ সেকেন্ড চেপে ধরে রাখুন (Long Press)**।
৩. একটি পাসওয়ার্ড ডায়ালগ আসবে। সেখানে দিন:  
   👉 **`Rafat@Friday`**  
৪. ডেভেলপার স্ক্রিন ওপেন হবে। সেখানে **Server URL** বক্সে আপনার Render URL পেস্ট করুন:  
   (যেমন: `https://bloodbridge-api.onrender.com` অথবা `https://bloodbridge-api.onrender.com/api/requests`)
৫. **"Save & Test Backend"** চাপুন। অ্যাপটি স্বয়ংক্রিয়ভাবে নতুন হাই-স্পিড ক্লাউড সার্ভারের সাথে কানেক্ট হয়ে যাবে!

---

## ৩. লোকাল পিসিতে টেস্ট করার নিয়ম:
```bash
cd bloodbridge-server
npm install
npm start
```
ব্রাউজারে যান: `http://localhost:3000`  
আপনি লাইভ ওয়েব ড্যাশবোর্ড দেখতে পাবেন।
