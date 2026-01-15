require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");

// ================= COMPANY LIST =================
const companies = [
  { company: "Spinny", contact: "Arshdeep Chhabra", email: "arshdeep.chhabra@gmail.com" },
  { company: "Skore (TTK Healthcare)", contact: "Vishal Vyas", email: "vish77in@gmail.com" },
  { company: "Renne", contact: "Anjali Verma", email: "anjali.valani@gmail.com" },
  { company: "Whisper", contact: "Mohit Assudani", email: "mohit.assudani@gmail.com" },
  { company: "Lumos Learning", contact: "Sizzil Choudhury", email: "support@lumoslearning.com" },
  { company: "Bewakoof", contact: "Abhimanyu Mishra", email: "abhimanyu@bewakoof.com" },
  { company: "Bewakoof", contact: "Shruti Wasulkar", email: "wasulkarshruti@gmail.com" },
  { company: "Zudio", contact: "Priti Shah", email: "pritikarekar@gmail.com" },
  { company: "KTM", contact: "Pawan Tandon", email: "tandon.paawan@gmail.com" },
  { company: "Maruti Suzuki", contact: "Himanshu Dahiya", email: "himanshu.dahiya@maruti.co.in" },
  { company: "TVS Motor Company", contact: "Aniruddha Haldar", email: "aniruddha.haldar@tvsmotor.com" },
  { company: "Bajaj Auto (Pulsar)", contact: "Suraj Nair", email: "suraj.nair@bajajauto.com" },
  { company: "Too Yumm (RPSG)", contact: "Robin Gupta", email: "robin2.gupta@gmail.com" },
  { company: "Sprinklr", contact: "Arun Pattabhiraman", email: "arun.pattabhiraman@sprinklr.com" },
  { company: "Haldiram Snacks", contact: "Divya Batra", email: "ranadiv@gmail.com" },
  { company: "Commudle", contact: "Apra Sahney", email: "apra@commudle.com" },
  { company: "JioSaavn", contact: "Ankita Dasgupta", email: "ankita.dasgupta@zenogroup.com" },
  { company: "GoDaddy", contact: "Apurva Palnitkar", email: "apalnitkar@godaddy.com" },
  { company: "Bikano", contact: "Kush Aggarwal", email: "kush.aggarwal@bikano.com" },
  { company: "Nestle (Nescafe)", contact: "Akshay J Antony", email: "akshay.j@nestle.com" },
  { company: "Devfolio", contact: "Denver Dsouza", email: "denver@devfolio.co" },
  { company: "Nord VPN", contact: "Audrius Bernatonis", email: "audrius.bernatonis@nordsecurity.com" },
  { company: "Polygon (Matic)", contact: "Annu Shekhawat", email: "annu.s@polygonlabs.us" },
  { company: "DigitalOcean", contact: "Bedabrata Bagchi", email: "bedabrata.bagchi@gmail.com" },
  { company: "CoinSwitch Kuber", contact: "Tej Manohar", email: "vtejmanohar@gmail.com" },
  { company: "Sticker Mule", contact: "Lenny Roudik", email: "lenny@stickermule.com" },
  { company: "Balsamiq", contact: "Arielle Kimbarovsky", email: "arielle@balsamiq.com" },
  { company: "Urban Company", contact: "Joel Cornelius", email: "joelcorneliusc99@gmail.com" },
  { company: "Veeba", contact: "Niyati Kochhar", email: "niyatikochhar@gmail.com" },
  { company: "Coding Ninjas", contact: "Ankush Goyal", email: "ankush.goyal90@gmail.com" },
  { company: "GeeksforGeeks", contact: "Aryan Sharma", email: "as089096@gmail.com" },
  { company: "Bikanervala", contact: "Gaurav Bisht", email: "gauravbisht1987@gmail.com" },
  { company: "Tinder", contact: "Raunaq Singh Kohli", email: "raunaq.sk@gmail.com" },
  { company: "Airtel", contact: "Sunny Agarwal", email: "sunny1510agarwal@gmail.com" },
  { company: "Castrol", contact: "Rohit Talwar", email: "rohit.talwar@castrol.com" },
  { company: "Internshala", contact: "Priyanshi Negi", email: null },
  { company: "Snap Inc", contact: "Sachit Prakash", email: "sprakash@snapchat.com" },
  { company: "Xiaomi India", contact: "Prashant Singh", email: "prashantsingh@xiaomi.com" },
  { company: "Swiggy", contact: "Sneha John", email: "sneha.john@swiggy.in" },
  { company: "Axis Bank", contact: "Supriya Ghosh", email: "supriya.ghosh@axisbank.com" },
  { company: "Blinkit", contact: "Rishi Arora", email: "rishi.arora@grofers.com" },
  { company: "Wrogn", contact: "Nishant Poddar", email: "nishant@usplworld.com" },
  { company: "Roadster (Myntra)", contact: "Sonal Bharti", email: "sonal.bharti@myntra.com" },
  { company: "Nivea", contact: "Ajay Simha", email: "ajay.simha@loreal.com" },
  { company: "Kotak Mahindra Bank", contact: "Sahar Khan", email: "sahar.khan@kotak.com" },
  { company: "Tata Motors", contact: "Pavan Allenki", email: "pavan.allenki@tatamotors.com" },
  { company: "Nothing Technology", contact: "Pranay Rao", email: "pranay.rao@nothing.tech" },
  { company: "Usha", contact: "Arindam Panda", email: "arindam_panda@usha.com" },
  { company: "Berger Paints", contact: "Deepak Masiwal", email: "masi.bergerpaints@gmail.com" },
  { company: "MX Player", contact: "Akshay Sharma", email: "akshay.sharma@mxplayer.in" },
  { company: "Amul", contact: "Sanjay Bansal", email: "sanjay.bansal@amul.coop" }
];


// ================= TRANSPORT =================
const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com",
    port: 587,
    secure: false, // IMPORTANT
  auth: {
    user: "jsanyam219@gmail.com",
    pass: "ktqhdfnblxfbclia"
  }
});

// ================= EMAIL SENDER =================
const delay = ms => new Promise(res => setTimeout(res, ms));

async function sendEmails() {
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];

    const mailOptions = {
      from: "jsanyam219@gmail.com",
      to: company.email,
      subject: "promote you business at anugoonj'26 annual cultural fest of GGSIPU",
      html: `
        <p>Dear ${company.company} Team,</p>

        <p>My name is <b>Sanyam Jain</b>,core memer of the sponsorship team of <b>ANUGOONJ'26.</b> I am reaching out on behalf of <b>GURU GOBIND SINGH INDRAPRASTHA UNIVERSITY</b>.</p>

        <p>We are exploring strategic sponsorship partnerships and would love to explore a sponsorship partnership with <b>${company.company}</b> and believe ${company.company} would be a strong brand fit for our audience.</p>
         

        <p><b>📊 Footwall at a Glance</b></p>
  <ul>
    <li><b>2 Lakh+</b> student footfall</li>
    <li><b>150+</b> colleges participating</li>
    <li><b>5000+</b> events & competitions participation</li>
    <li><b>3-day</b> on-ground festival</li>
    <li><b>1,000,000+</b> digital reach (Instagram & promotions)</li>
  </ul>


        <p><b>Sponsorship Benefits:</b></p>
        <ul>
          <li>Brand visibility across campus & social media</li>
          <li>Direct engagement with students</li>
          <li>Logo placement on banners & posters</li>
        </ul>

        <p>Please find our sponsorship proposal attached.We would be happy to connect on a brief call to discuss potential collabration opportunities and ideas.</p>

        <p>Looking forward to your response.</p>

        <p>Warm regards,<br/>
        <b>Sanyam Jain</b><br/>
        📧 jsanyam219@gmail.com<br/>
           7678317928
        </p>
      `,
      attachments: [
        {
          filename: "Sponsorship_Proposal.pdf",
          path: "./utils/Anugoonj 26 Sponsorship Brochure.pdf"
        }
      ]
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Sent to ${company.company} (${company.email})`);
    } catch (err) {
      console.error(`❌ Failed for ${company.email}`, err.message);
    }

    // 7 sec delay (anti-spam)
    await delay(3000);
  }

  console.log("🎉 All emails processed");
}

sendEmails();
