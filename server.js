const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Route to handle chatbot messages
app.post('/chat', async (req, res) => {
  const originalMsg = req.body.message;
  const msg = originalMsg.toLowerCase();

  console.log("🔍 Received message:", originalMsg);
  let reply = "Sorry, I couldn't find relevant info.";
  try {
    let url = '';

    if (msg.includes("vision") || msg.includes("mission")) {
      url = 'http://gweca.ac.in/Welcome/vision';
    } else if (
      msg.includes("principal") ||
      msg.includes("chairman") ||
      msg.includes("registrar") ||
      msg.includes("academic coordinator") ||
      msg.includes("prakriti") ||
      msg.includes("bog") ||
      msg.includes("shyam") ||
      msg.includes("asif")
    ) {
      url = 'http://gweca.ac.in/Welcome/administration';
    } else if (msg.includes("branch")) {
      url = 'http://www.gweca.ac.in/';
    } else if (msg.includes("faculty")) {
      url = 'http://gweca.ac.in/Welcome/administration';
    } else if (
      msg.includes("contact") ||
      msg.includes("address") ||
      msg.includes("phone") ||
      msg.includes("email")
    ) {
      url = 'http://www.gweca.ac.in/';
    } else if (msg.includes("hod")) {
      url = 'http://gweca.ac.in/Welcome';
    } else if (
      msg.includes("library") ||
      msg.includes("seating capacity") ||
      msg.includes("reprography") ||
      msg.includes("digital library") ||
      msg.includes("mess") ||
      msg.includes("meal") ||
      msg.includes("breakfast") ||
      msg.includes("lunch") ||
      msg.includes("dinner") ||
      msg.includes("tea")
    ) {
      url = 'http://gweca.ac.in/Facilities';
    }else if (msg.includes("tpo head")||msg.includes("tpo")) {
      url = 'http://gweca.ac.in/Welcome/view_department/10';
    }

    if (url) {
      reply = await scrapeGWECAUnified(url, msg);
    } else {
      reply = "Try asking about 'vision', 'mission', 'admissions', 'courses', 'faculty', 'library', or 'contact'.";
    }
  } catch (err) {
    console.log("❌ Error while processing request:", err);
    reply = "Error: " + err.message;
  }

  console.log("🤖 Sending reply:", reply);
  res.json({ reply });
});

async function scrapeGWECAUnified(url, keyword) {
  console.log("✅ scrapeGWECAUnified called with:", keyword);
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const lowerKeyword = keyword.toLowerCase();

  if (lowerKeyword.includes("principal") || lowerKeyword.includes("prakriti")) {
    return `🏫 Principal:\n\n- Name: Prof. Prakriti Trivedi\n- Designation: Principal, Government Women Engineering College Ajmer\n`;
  }

  if (lowerKeyword.includes("tpo")||lowerKeyword.includes("tpo head")) {
    return `📚 TPO Head - Yashvin Gupta\n🎓 Qualification: M.Tech\n📧 Email: tpo@gweca.ac.in\n📞 Contact: +91-1234567890`;
  }

  if (lowerKeyword.includes("chairman") || lowerKeyword.includes("bog")) {
    return `👨‍⚖️ Chairman - Board of Governors:\n\n- Name: Prof. N. C. Shivaprakash\n- Affiliation: Indian Institute of Science (IISc), Bangalore\n- Role: Chairman, Board of Governors, Women Engineering College Ajmer\n- Profile: http://iap.iisc.ac.in/people/n-c-shivaprakash/\n`;
  }

  if (lowerKeyword.includes("registrar")) {
    return `🧾 Registrar Info:\n\n- Name: Er. Asif Sayeed Khan\n- Qualifications: M.E. (Digital Communication Engg.), B.E. (E.C.E.)\n- Designation: Asst.Professor, ECE Department\n- Contact: Faculty Room No. F-217, Dept. of ECE, GWECA\n- Email: asif@gweca.ac.in\n`;
  }

  if (lowerKeyword.includes("academic coordinator") || lowerKeyword.includes("shyam")) {
    return `📘 Academic Coordinator:\n\n- Name: Dr. Shyam Sunder Sharma\n- Qualifications: Ph.D. (Physics), M.Sc., B.Sc., NET (2 times), GATE (AIR-155), SLET, PGDCA\n- Department: Humanities and Sciences\n- Contact: Room No. 110, Himaliya Bhawan, GWECA\n- Email: shyam@gweca.ac.in\n`;
  }

  if (
    lowerKeyword.includes("address") &&
    !lowerKeyword.includes("email") &&
    !lowerKeyword.includes("phone") &&
    !lowerKeyword.includes("contact")
  ) {
    const addressElement = $('h5:contains("Contact Us")').next('ul').find('li').first();
    const addressText = addressElement.text().trim();
    return addressText ? `🏢 GWECA Address:\n\n${addressText}\n` : 'No address found.\n';
  }

  if (lowerKeyword.includes("contact") || lowerKeyword.includes("phone") || lowerKeyword.includes("email")) {
    const emails = [];
    const phones = [];

    $('a[href^="mailto:"]').each((i, el) => {
      const email = $(el).text().trim();
      if (email.includes('@')) emails.push(email);
    });

    $('a[href^="tel:"]').each((i, el) => {
      const phone = $(el).text().trim();
      if (phone) phones.push(phone);
    });

    const emailText = emails.length ? `📧 Emails:\n- ${emails.join('\n- ')}` : 'No email found.';
    const phoneText = phones.length ? `📞 Phone Numbers:\n- ${phones.join('\n- ')}` : 'No phone numbers found.';

    return `📞 GWECA Contact Details:\n\n${emailText}\n${phoneText}`;
  }

  if (lowerKeyword.includes("vision")) {
    const visionHeader = $('h3.theme-background:contains("Vision")').text().trim();
    const visionText = $('div:contains("Vision") p').first().text().trim();
    return visionText ? `🎯 ${visionHeader}\n\n${visionText}` : 'No vision found.';
  }

  if (lowerKeyword.includes("mission")) {
    const missionHeader = $('h3.theme-background:contains("Mission")').text().trim();
    const missionListItems = $('div.my-box.mission ul li').map((i, el) => $(el).text().trim()).get();
    return missionListItems.length ? `🚀 ${missionHeader}\n\n- ${missionListItems.join('\n- ')}` : 'No mission found.';
  }

  const branchHODs = {
    "artificial intelligence and machine learning": {
      name: "Dr. Ashok Kumar",
      designation: "Asst.Professor",
      email: "ashok.kumar@gweca.ac.in"
    },
    "computer science & engineering": {
      name: "Dr. Meeta Sharma",
      designation: "Asst.Professor",
      email: "meetasharma@gweca.ac.in"
    },
    "electrical and electronics engineering": {
      name: "Mr. S.N Joshi",
      designation: "Asst.Professor",
      email: "snjoshi@gweca.ac.in"
    },
    "electrical engineering": {
      name: "Mr. S.N Joshi",
      designation: "Asst.Professor",
      email: "snjoshi@gweca.ac.in"
    },
    "electronics and communication engineering": {
      name: "Dr. Hemant Kumar Vijayvergia",
      designation: "Asst.Professor",
      email: "hemantvijay@gweca.ac.in"
    },
    "humanities and sciences": {
      name: "Dr. Priya Advani",
      designation: "Asst.Professor",
      email: "priyaadvani@gweca.ac.in"
    },
    "information technology": {
      name: "Dr. Meeta Sharma",
      designation: "Asst.Professor",
      email: "meetasharma@gweca.ac.in"
    },
    "master of computer application": {
      name: "Dr. Meeta Sharma",
      designation: "Asst.Professor",
      email: "meetasharma@gweca.ac.in"
    },
    "mechanical engineering": {
      name: "Mr. Yashvin Gupta",
      designation: "Asst.Professor",
      email: "yashvingupta@gweca.ac.in"
    }
  };

  if (lowerKeyword.includes("hod") && lowerKeyword.includes("all")) {
    return "📚 Branches with HODs at GWECA:\n\n" +
      Object.entries(branchHODs)
        .map(([branch, info]) => `- ${capitalizeWords(branch)}: ${info.name}`)
        .join('\n');
  }

  const matchedBranch = Object.keys(branchHODs).find(branch => lowerKeyword.includes(branch));
  if ((lowerKeyword.includes("hod") || lowerKeyword.includes("email") || lowerKeyword.includes("name")) && matchedBranch) {
    const info = branchHODs[matchedBranch];
    return `👨‍🏫 HOD - ${capitalizeWords(matchedBranch)}:\n\n- Name: ${info.name}\n- Designation: ${info.designation}\n- Email: ${info.email}`;
  }

  if (lowerKeyword.includes("branch")) {
    return `📚 Available Branches at GWECA:\n\n- ${Object.keys(branchHODs).map(capitalizeWords).join("\n- ")}`;
  }

  if (lowerKeyword.includes("library")) {
    if (lowerKeyword.includes("seating")) return "🪑 Library Seating Capacity: 250 Students.";
    if (lowerKeyword.includes("reprography")) return "🖨️ Reprography Facility: Available.";
    if (lowerKeyword.includes("working hours") || lowerKeyword.includes("timing")) return "⏰ Library Working Hours: 9.00 AM to 7.00 PM.";
    if (lowerKeyword.includes("internet")) return "🌐 Internet Facility: Available in the library.";
    if (lowerKeyword.includes("users") || lowerKeyword.includes("total users")) return "📊 Total Library Users: Approximately 1500.";
    if (lowerKeyword.includes("digital") || lowerKeyword.includes("computers")) return "💻 Digital Library Info:\n\n- 20 computers for e-journals and study\n- 7 for office\n- WiFi and CCTV enabled.";
    return `📚 Library Info:\n\n- Seating Capacity: 250 Students\n- Reprography: Available\n- Hours: 9:00 AM - 7:00 PM\n- Internet: Available\n- Users: ~1500\n- Digital: 20 user computers, 7 office computers`;
  }

  if (
    keyword.includes("mess") ||
    keyword.includes("meal") ||
    keyword.includes("breakfast") ||
    keyword.includes("lunch") ||
    keyword.includes("dinner") ||
    keyword.includes("tea")
  ) {
    if (keyword.includes("breakfast")) return "🍽️ Breakfast Time: 7:30 AM to 9:00 AM";
    if (keyword.includes("lunch")) return "🍽️ Lunch Time: 11:30 AM to 2:30 PM";
    if (keyword.includes("tea")) return "🍽️ Tea Time: 4:30 PM to 5:00 PM";
    if (keyword.includes("dinner")) return "🍽️ Dinner Time: 7:00 PM to 8:30 PM";
    return `🍽️ Hostel Mess Timings:\n- Breakfast: 7:30 AM to 9:00 AM\n- Lunch: 11:30 AM to 2:30 PM\n- Tea: 4:30 PM to 5:00 PM\n- Dinner: 7:00 PM to 8:30 PM`;
  }

  return "No relevant information found. Please try with another keyword.";
}

function capitalizeWords(text) {
  return text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});