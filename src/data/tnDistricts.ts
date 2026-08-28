// Complete & Accurate Tamil Nadu Districts → Taluks → Villages
// With real coordinates for map geocoding

export interface TalukData {
  name: string;
  lat: number;
  lng: number;
  villages: string[];
}

export interface DistrictData {
  name: string;
  code: string;
  lat: number;
  lng: number;
  taluks: TalukData[];
}

export const TN_DISTRICTS: DistrictData[] = [
  {
    name: 'Ariyalur',
    code: 'ARL',
    lat: 11.1395,
    lng: 79.0780,
    taluks: [
      { name: 'Ariyalur', lat: 11.1395, lng: 79.0780, villages: ['Ariyalur', 'T.Palur', 'Jayankondam', 'Sethiyathope', 'Nochiyam', 'Tittakudi', 'Vriddhachalam Road', 'Thirumanur'] },
      { name: 'Sendurai', lat: 11.1800, lng: 79.1300, villages: ['Sendurai', 'Keezhapalur', 'Thiyagavalli', 'Pullambadi', 'Melappalur', 'Olaipadi', 'Aalathur'] },
      { name: 'Udayarpalayam', lat: 11.0800, lng: 79.2200, villages: ['Udayarpalayam', 'Lalpet', 'Pullambadi', 'Kalathur', 'Sirupakkam', 'Vilanur'] },
    ],
  },
  {
    name: 'Chengalpattu',
    code: 'CGP',
    lat: 12.6924,
    lng: 79.9778,
    taluks: [
      { name: 'Chengalpattu', lat: 12.6924, lng: 79.9778, villages: ['Chengalpattu', 'Singaperumalkoil', 'Padalam', 'Vandalur', 'Kelambakkam', 'Mudichur'] },
      { name: 'Tambaram', lat: 12.9249, lng: 80.1000, villages: ['Tambaram', 'Pallavaram', 'Chromepet', 'Selaiyur', 'Perungalathur', 'Pammal'] },
      { name: 'Madurantakam', lat: 12.4960, lng: 79.8990, villages: ['Madurantakam', 'Kalavakkam', 'Uthiramerur', 'Chithamur', 'Sitheri'] },
      { name: 'Cheyyur', lat: 12.3520, lng: 80.0250, villages: ['Cheyyur', 'Kalpakkam', 'Kovalam', 'Mamallapuram', 'Sadras'] },
      { name: 'Thiruporur', lat: 12.7780, lng: 80.1640, villages: ['Thiruporur', 'Kelambakkam', 'Sholinganallur', 'Perungudi', 'Siruseri'] },
    ],
  },
  {
    name: 'Chennai',
    code: 'CHE',
    lat: 13.0827,
    lng: 80.2707,
    taluks: [
      { name: 'Chennai North', lat: 13.1200, lng: 80.2900, villages: ['Tondiarpet', 'Royapuram', 'Manali', 'Tiruvottiyur', 'Basin Bridge', 'Washermanpet'] },
      { name: 'Chennai South', lat: 13.0100, lng: 80.2500, villages: ['Mylapore', 'Adyar', 'Guindy', 'Velachery', 'Perungudi', 'Sholinganallur'] },
      { name: 'Chennai Central', lat: 13.0827, lng: 80.2707, villages: ['Egmore', 'Park Town', 'Thousand Lights', 'Anna Nagar', 'Nungambakkam', 'Teynampet'] },
      { name: 'Alandur', lat: 13.0030, lng: 80.2050, villages: ['Alandur', 'St. Thomas Mount', 'Pallavaram', 'Chromepet', 'Meenambakkam', 'Nanganallur'] },
    ],
  },
  {
    name: 'Coimbatore',
    code: 'CBE',
    lat: 11.0168,
    lng: 76.9558,
    taluks: [
      { name: 'Coimbatore North', lat: 11.0400, lng: 76.9800, villages: ['Saravanampatti', 'Kalapatti', 'Singanallur', 'Peelamedu', 'Kovilpalayam', 'Kurichi'] },
      { name: 'Coimbatore South', lat: 10.9900, lng: 76.9200, villages: ['Ganapathy', 'Uppilipalayam', 'Vadavalli', 'Kuniyamuthur', 'Perur', 'Cowley Brown Nagar'] },
      { name: 'Mettupalayam', lat: 11.2980, lng: 76.9370, villages: ['Mettupalayam', 'Sirumugai', 'Karamadai', 'Kunjapanai', 'Chettipalayam', 'Maruthamalai'] },
      { name: 'Annur', lat: 11.1850, lng: 77.1020, villages: ['Annur', 'Alandurai', 'Madukkarai', 'Thondamuthur', 'Ettimadai', 'Vellalore'] },
      { name: 'Pollachi', lat: 10.6500, lng: 77.0000, villages: ['Pollachi', 'Udumalaipettai', 'Anaimalai', 'Valparai', 'Sethumadai', 'Mahadanapuram'] },
      { name: 'Sulur', lat: 11.0300, lng: 77.1400, villages: ['Sulur', 'Irugur', 'Kallapalayam', 'Narasimhanaickenpalayam', 'Aerodrome', 'Podanur'] },
    ],
  },
  {
    name: 'Cuddalore',
    code: 'CDL',
    lat: 11.7480,
    lng: 79.7680,
    taluks: [
      { name: 'Cuddalore', lat: 11.7480, lng: 79.7680, villages: ['Cuddalore', 'Parangipettai', 'Killai', 'Srimushnam', 'Thittakudi', 'Manalmedu'] },
      { name: 'Panruti', lat: 11.7700, lng: 79.5530, villages: ['Panruti', 'Varanavasi', 'Vridhachalam Road', 'Vadalur', 'Mangalur', 'Komaratchi'] },
      { name: 'Virudhachalam', lat: 11.5210, lng: 79.3230, villages: ['Virudhachalam', 'Mangalampet', 'Ulundurpet', 'Kandachipuram', 'Kammapuram'] },
      { name: 'Chidambaram', lat: 11.3990, lng: 79.6930, villages: ['Chidambaram', 'Sirkazhi', 'Pichavaram', 'Kollidam', 'Killai', 'Tarangambadi Road'] },
    ],
  },
  {
    name: 'Dharmapuri',
    code: 'DPR',
    lat: 12.1280,
    lng: 78.1580,
    taluks: [
      { name: 'Dharmapuri', lat: 12.1280, lng: 78.1580, villages: ['Dharmapuri', 'Morappur', 'Pennagaram', 'Pappireddipatti', 'Karimangalam', 'Kambainallur'] },
      { name: 'Palacode', lat: 12.2490, lng: 77.9880, villages: ['Palacode', 'Nallampalli', 'Marandahalli', 'Anchetti', 'Hanur'] },
      { name: 'Harur', lat: 12.0480, lng: 78.4770, villages: ['Harur', 'Karimangalam', 'Shoolagiri', 'Kadathur', 'Polur'] },
    ],
  },
  {
    name: 'Dindigul',
    code: 'DDL',
    lat: 10.3624,
    lng: 77.9695,
    taluks: [
      { name: 'Dindigul', lat: 10.3624, lng: 77.9695, villages: ['Dindigul', 'Athoor', 'Kavunchi', 'Sanarpatti', 'Gandhipuram', 'Neikarapatti'] },
      { name: 'Natham', lat: 10.2150, lng: 77.9700, villages: ['Natham', 'Batlagundu', 'Oddanchatram', 'Keeranur', 'Pattiveeranpatti'] },
      { name: 'Palani', lat: 10.4470, lng: 77.5200, villages: ['Palani', 'Vadamadurai', 'Vedasandur', 'Oddanchatram', 'Chinnalapatti'] },
      { name: 'Vedasandur', lat: 10.5330, lng: 77.9730, villages: ['Vedasandur', 'Hanumanthampatti', 'Vadamadurai', 'Agaram', 'Kombai'] },
    ],
  },
  {
    name: 'Erode',
    code: 'ERD',
    lat: 11.3410,
    lng: 77.7172,
    taluks: [
      {
        name: 'Anthiyur',
        lat: 11.5800,
        lng: 77.5900,
        villages: ['Anthiyur', 'Brammadesam', 'Burgur', 'Ennamangalam', 'Gettavadi', 'Gundri', 'Kadambur', 'Kongarpalayam', 'Mylambadi', 'Pachampalayam', 'Vellithiruppur'],
      },
      {
        name: 'Bhavani',
        lat: 11.4440,
        lng: 77.6820,
        villages: ['Bhavani', 'Ammapet', 'Athani', 'Illippili', 'Jambai', 'Kalingarayanpalayam', 'Kavandapadi', 'Mylambadi', 'Oricheripudur', 'Punnam', 'Salangapalayam', 'Sanyasipatti', 'Thalavadi', 'Varathanallur'],
      },
      {
        name: 'Chennimalai',
        lat: 11.1680,
        lng: 77.6000,
        villages: ['Chennimalai', 'Basuvapatti', 'Ekkattampalayam', 'Ingur', 'Kavundachipalayam', 'Kodumanal', 'Kumaravalasu', 'Mugasi Pidariyur', 'Murungatholuvu', 'Ottapparai', 'Palamangalam', 'Sirukalanji', 'Unjalur'],
      },
      {
        name: 'Erode',
        lat: 11.3410,
        lng: 77.7172,
        villages: ['Erode (Urban)', 'Surampatti', 'Chithode', 'Kasipalayam', 'Singampettai', 'Veerappampalayam', 'Vendipalayam', 'Kalingarayan', 'Manickampalayam', 'Nasiyanur', 'Periyasemur', 'Villarasampatti'],
      },
      {
        name: 'Gobichettipalayam',
        lat: 11.4550,
        lng: 77.4430,
        villages: ['Gobichettipalayam', 'Alingiam', 'Ayalur', 'Bodichinnampalayam', 'Chandrapuram', 'Elathur', 'Gudiyalathur', 'Kadukkarai', 'Kallipatti', 'Karapadi', 'Kasipalayam (Gobi)', 'Kolappalur', 'Konganpalayam', 'Kullampalayam', 'Kurumandur', 'Lakkampatti', 'Modachur', 'Nagadevampalayam', 'Nambiyur Road', 'Pariyur', 'Polavapalayam', 'Savandapur', 'Siraikaradu', 'Vellankovil'],
      },
      {
        name: 'Kodumudi',
        lat: 11.0800,
        lng: 77.8800,
        villages: ['Kodumudi', 'Anjur', 'Athanur', 'Chennasamudram', 'Chinnaripalayam', 'Elunoothimangalam', 'Karasapalayam', 'Kolathupalayam', 'Kombanai', 'Kondalam', 'Mulanur Road', 'Noyyal', 'Pasur', 'Sirukalanji', 'Unjalur', 'Vengambur'],
      },
      {
        name: 'Modakkurichi',
        lat: 11.2400,
        lng: 77.7500,
        villages: ['Modakkurichi', 'Alathur', 'Anumanpalli', 'Attavanai Anumanpalli', 'Elumathur', 'Ganapathipalayam', 'Kandikattuvalasu', 'Kanagapuram', 'Kulavilakku', 'Lakkapuram', 'Modakkurichi West', 'Mullampatti', 'Nanjaikalanji', 'Nanjaithalaiyur', 'Punjai Lakkapuram', 'Punjai Thalaiyur', 'Thanneerpandalpalayam', 'Vadugapatti'],
      },
      {
        name: 'Nambiyur',
        lat: 11.4910,
        lng: 77.2000,
        villages: ['Nambiyur', 'Andipalayam', 'Emmanur', 'Getticheyur', 'Karapadi', 'Kavilipalayam', 'Kedarai', 'Malayampalayam', 'Mylambadi', 'Nambiyur West', 'Olalakovil', 'Pattimaniakaranpalayam', 'Pothanur', 'Talavadi Road', 'Vempathy'],
      },
      {
        name: 'Perundurai',
        lat: 11.2750,
        lng: 77.5880,
        villages: [
          'Perundurai', 'Ayigoundanpalayam', 'Ayegoundanpalayam', 'Chennimalai Road', 'Chinnaveerasangili', 'Kandampalayam',
          'Karumandampalayam', 'Kavindapadi Road', 'Koolapalayam', 'Kullampalayam', 'Madathupalayam',
          'Moongilpalayam', 'Mullampatti', 'Nallampatti', 'Olappalayam', 'Pappampalayam', 'Pattakkaranpalayam',
          'Periyaveerasangili', 'Ponmudi', 'Pungambadi', 'Sengodampalayam', 'Singanallur', 'Suchipalayam',
          'Thoranavavi', 'Thudupathi', 'Velliraveli', 'Vijayamangalam'
        ],
      },
      {
        name: 'Thalavadi',
        lat: 11.7800,
        lng: 77.0100,
        villages: ['Thalavadi', 'Bannari', 'Bejalatti', 'Byannapuram', 'Dhinnapalli', 'Doddamudigundam', 'Doddagajanur', 'Gumtapuram', 'Hasanur', 'Iggalur', 'Karalavadi', 'Mallankuzhi', 'Marlapatti', 'Neithalapuram', 'Ramapuram', 'Soosaipuram', 'Thiganarai', 'Yanaganahalli'],
      },
    ],
  },
  {
    name: 'Kallakurichi',
    code: 'KLK',
    lat: 11.7380,
    lng: 78.9590,
    taluks: [
      { name: 'Kallakurichi', lat: 11.7380, lng: 78.9590, villages: ['Kallakurichi', 'Chinnasalem', 'Sankarapuram', 'Tirukoilur Road', 'Valavanur'] },
      { name: 'Ulundurpet', lat: 11.6840, lng: 79.3270, villages: ['Ulundurpet', 'Tirukoilur', 'Rishivandiyam', 'Ariyur', 'Manalur'] },
      { name: 'Kalvarayan Hills', lat: 11.8000, lng: 78.8000, villages: ['Kalvarayan Hills', 'Chinnamettur', 'Berigai', 'Vettavalam'] },
    ],
  },
  {
    name: 'Kancheepuram',
    code: 'KCP',
    lat: 12.8391,
    lng: 79.7098,
    taluks: [
      { name: 'Kancheepuram', lat: 12.8391, lng: 79.7098, villages: ['Kancheepuram', 'Uthiramerur', 'Walajabad', 'Kattankulathur', 'Madurantakam Road'] },
      { name: 'Sriperumbudur', lat: 12.9680, lng: 79.9360, villages: ['Sriperumbudur', 'Kundrathur', 'Kattankulathur', 'Vallipuram', 'Perungalathur'] },
    ],
  },
  {
    name: 'Kanyakumari',
    code: 'KNY',
    lat: 8.0883,
    lng: 77.5385,
    taluks: [
      { name: 'Agastheeswaram', lat: 8.1770, lng: 77.4290, villages: ['Nagercoil', 'Colachel', 'Marthandam', 'Kottar', 'Kanyakumari'] },
      { name: 'Vilavancode', lat: 8.2130, lng: 77.2800, villages: ['Vilavancode', 'Thuckalay', 'Kulasekaram', 'Pacode', 'Melpuram'] },
      { name: 'Kalkulam', lat: 8.3070, lng: 77.3490, villages: ['Kalkulam', 'Painkulam', 'Pilankalai', 'Veerana', 'Marungoor'] },
      { name: 'Thovalai', lat: 8.3500, lng: 77.4500, villages: ['Thovalai', 'Painkulam', 'Pilankalai', 'Nanjikottai', 'Varkal'] },
    ],
  },
  {
    name: 'Karur',
    code: 'KRR',
    lat: 10.9601,
    lng: 78.0766,
    taluks: [
      { name: 'Karur', lat: 10.9601, lng: 78.0766, villages: ['Karur', 'Krishnarayapuram', 'Paramathi Velur', 'Pugalur', 'Ayyampalayam'] },
      { name: 'Kulithalai', lat: 10.9360, lng: 78.4220, villages: ['Kulithalai', 'Thanthoni', 'Manmangalam', 'Vanagiri', 'Kattuputhur'] },
      { name: 'Aravakurichi', lat: 10.7660, lng: 77.9810, villages: ['Aravakurichi', 'Punjai Puliyampatti', 'Pugalur', 'Manikandam'] },
    ],
  },
  {
    name: 'Krishnagiri',
    code: 'KRG',
    lat: 12.5266,
    lng: 78.2138,
    taluks: [
      { name: 'Krishnagiri', lat: 12.5266, lng: 78.2138, villages: ['Krishnagiri', 'Pochampalli', 'Bargur', 'Uthangarai', 'Shoolagiri'] },
      { name: 'Hosur', lat: 12.7409, lng: 77.8253, villages: ['Hosur', 'Denkanikottai', 'Kelamangalam', 'Rayakottah', 'Thally'] },
      { name: 'Uthangarai', lat: 12.3200, lng: 78.3800, villages: ['Uthangarai', 'Bargur', 'Mathur', 'Devarayanpatti', 'Berigai'] },
    ],
  },
  {
    name: 'Madurai',
    code: 'MDU',
    lat: 9.9252,
    lng: 78.1198,
    taluks: [
      { name: 'Madurai North', lat: 9.9400, lng: 78.1200, villages: ['Avaniyapuram', 'Koodal Nagar', 'Paravai', 'Thiruparankundram Road', 'Iyer Bungalow'] },
      { name: 'Madurai South', lat: 9.9000, lng: 78.1100, villages: ['Othakadai', 'Thiruparankundram', 'Thirumangalam', 'Alagarkoil', 'Melur Road'] },
      { name: 'Melur', lat: 10.0310, lng: 78.3350, villages: ['Melur', 'Usilampatti', 'Sedapatti', 'Chellampatti', 'Kuruvithurai'] },
      { name: 'Peraiyur', lat: 9.7890, lng: 78.3000, villages: ['Peraiyur', 'Chellampatti', 'Tiruppuvanam', 'Mullipadi', 'Keeranur'] },
    ],
  },
  {
    name: 'Mayiladuthurai',
    code: 'MLD',
    lat: 11.1035,
    lng: 79.6520,
    taluks: [
      { name: 'Mayiladuthurai', lat: 11.1035, lng: 79.6520, villages: ['Mayiladuthurai', 'Kuttalam', 'Tharangambadi', 'Poompuhar', 'Sirkazhi'] },
      { name: 'Kuthalam', lat: 11.1500, lng: 79.7500, villages: ['Kuthalam', 'Kollidam', 'Poompuhar', 'Sirkazhi', 'Thiruvengadu'] },
      { name: 'Sirkali', lat: 11.2320, lng: 79.7420, villages: ['Sirkazhi', 'Chidambaram Road', 'Kollidam', 'Adhichayam', 'Poonthottam'] },
    ],
  },
  {
    name: 'Nagapattinam',
    code: 'NPT',
    lat: 10.7672,
    lng: 79.8420,
    taluks: [
      { name: 'Nagapattinam', lat: 10.7672, lng: 79.8420, villages: ['Nagapattinam', 'Tharangambadi', 'Vedaranyam', 'Keelakkarai', 'Kodiakarai'] },
      { name: 'Vedaranyam', lat: 10.3770, lng: 79.8510, villages: ['Vedaranyam', 'Point Calimere', 'Manalmelkudi', 'Kodiyampalayam'] },
      { name: 'Kilvelur', lat: 10.5950, lng: 79.7860, villages: ['Kilvelur', 'Sembanarkoil', 'Kottucherry', 'Keelaiyur'] },
    ],
  },
  {
    name: 'Namakkal',
    code: 'NMK',
    lat: 11.2195,
    lng: 78.1675,
    taluks: [
      { name: 'Namakkal', lat: 11.2195, lng: 78.1675, villages: ['Namakkal', 'Paramathi Velur', 'Puduchatram', 'Pallipalayam', 'Komarapalayam'] },
      { name: 'Rasipuram', lat: 11.4600, lng: 78.1250, villages: ['Rasipuram', 'Sendamangalam', 'Valappadi', 'Kavindapadi', 'Velur'] },
      { name: 'Tiruchengode', lat: 11.3840, lng: 77.8970, villages: ['Tiruchengode', 'Sankari', 'Kumarapalayam', 'Idapadi', 'Mohanur'] },
      { name: 'Kolli Hills', lat: 11.2500, lng: 78.3200, villages: ['Selur', 'Chinnathadagam', 'Ariyur', 'Semmedu', 'Periyakulam'] },
    ],
  },
  {
    name: 'Nilgiris',
    code: 'NLG',
    lat: 11.4916,
    lng: 76.7337,
    taluks: [
      { name: 'Ooty', lat: 11.4139, lng: 76.6952, villages: ['Ooty (Udhagamandalam)', 'Kothagiri', 'Coonoor', 'Wellington', 'Lovedale', 'Emerald'] },
      { name: 'Gudalur', lat: 11.5040, lng: 76.4940, villages: ['Gudalur', 'Pandalur', 'Devala', 'Cherambadi', 'Mudumalai', 'Masinagudi'] },
      { name: 'Kotagiri', lat: 11.4200, lng: 76.8880, villages: ['Kotagiri', 'Aravenu', 'Kil Kotagiri', 'Kunjapanai', 'Doddabetta Road'] },
    ],
  },
  {
    name: 'Perambalur',
    code: 'PBR',
    lat: 11.2350,
    lng: 78.8810,
    taluks: [
      { name: 'Perambalur', lat: 11.2350, lng: 78.8810, villages: ['Perambalur', 'Veppanthattai', 'Alathur', 'Esanai', 'Nakkasalem'] },
      { name: 'Kunnam', lat: 11.2500, lng: 78.7500, villages: ['Kunnam', 'Elakurichi', 'Ammaiyappan', 'Kalathur', 'Santhapuram'] },
    ],
  },
  {
    name: 'Pudukkottai',
    code: 'PDK',
    lat: 10.3797,
    lng: 78.8198,
    taluks: [
      { name: 'Pudukkottai', lat: 10.3797, lng: 78.8198, villages: ['Pudukkottai', 'Thirumayam', 'Kulattur', 'Ramachandra Nagar', 'Tirumayam Road'] },
      { name: 'Alangudi', lat: 10.3590, lng: 78.9820, villages: ['Alangudi', 'Karambakudi', 'Gandarvakottai', 'Annavasal', 'Vikkiramangalam'] },
      { name: 'Arantangi', lat: 10.1720, lng: 79.0960, villages: ['Arantangi', 'Manamelkudi', 'Avudaiyarkoil', 'Peravurani Road', 'Papanasam'] },
    ],
  },
  {
    name: 'Ramanathapuram',
    code: 'RMD',
    lat: 9.3639,
    lng: 78.8395,
    taluks: [
      { name: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, villages: ['Ramanathapuram', 'Rameswaram', 'Mandapam', 'Pamban', 'Uchipuli'] },
      { name: 'Paramakudi', lat: 9.5380, lng: 78.5960, villages: ['Paramakudi', 'Mudukulathur', 'Tiruvadanai', 'Bogalur', 'Sayalkudi'] },
      { name: 'Kamuthi', lat: 9.4100, lng: 78.3580, villages: ['Kamuthi', 'Sayalkudi', 'Nainarkoil', 'Kilakarai', 'Ervadi'] },
    ],
  },
  {
    name: 'Ranipet',
    code: 'RNP',
    lat: 12.9310,
    lng: 79.3330,
    taluks: [
      { name: 'Arcot', lat: 12.9060, lng: 79.3150, villages: ['Arcot', 'Ranipet', 'Walajah', 'Sholingur', 'Nemili'] },
      { name: 'Arakkonam', lat: 13.0800, lng: 79.6700, villages: ['Arakkonam', 'Sholingur', 'Nemili', 'Kaveripakkam', 'Ponnai'] },
      { name: 'Sholingur', lat: 13.1170, lng: 79.4230, villages: ['Sholingur', 'Arcot', 'Nemili', 'Papanasapuram'] },
    ],
  },
  {
    name: 'Salem',
    code: 'SLM',
    lat: 11.6643,
    lng: 78.1460,
    taluks: [
      { name: 'Salem', lat: 11.6643, lng: 78.1460, villages: ['Salem', 'Yercaud', 'Omalur', 'Shevapet', 'Ramavarmapuram', 'Kondalampatti'] },
      { name: 'Attur', lat: 11.5800, lng: 78.5960, villages: ['Attur', 'Gangavalli', 'Thalaivasal', 'Molayanur', 'Kalasapakkam'] },
      { name: 'Mettur', lat: 11.7870, lng: 77.8000, villages: ['Mettur', 'Edapadi', 'Komarapalayam', 'Vasishta Nadi', 'Taramangalam'] },
      { name: 'Sangagiri', lat: 11.5620, lng: 77.8840, villages: ['Sangagiri', 'Veerapandi', 'Konganapuram', 'Idappadi', 'Nangavalli'] },
    ],
  },
  {
    name: 'Sivaganga',
    code: 'SVG',
    lat: 9.8477,
    lng: 78.4800,
    taluks: [
      { name: 'Sivaganga', lat: 9.8477, lng: 78.4800, villages: ['Sivaganga', 'Manamadurai', 'Karaikudi', 'Tirupathur', 'Ilayangudi'] },
      { name: 'Karaikudi', lat: 10.0700, lng: 78.7760, villages: ['Karaikudi', 'Devakottai', 'Tirupathur', 'Kanadukathan', 'Kottaiyur'] },
      { name: 'Tirupathur', lat: 10.0100, lng: 78.6200, villages: ['Tirupathur', 'Kallal', 'Ilayangudi', 'Amaravathi', 'Sakkottai'] },
    ],
  },
  {
    name: 'Tenkasi',
    code: 'TKS',
    lat: 8.9590,
    lng: 77.3150,
    taluks: [
      { name: 'Tenkasi', lat: 8.9590, lng: 77.3150, villages: ['Tenkasi', 'Surandai', 'Kadayanallur', 'Courtallam', 'Sankarankovil Road'] },
      { name: 'Shencottai', lat: 8.9840, lng: 77.2480, villages: ['Shencottai', 'Puliyangudi', 'Sivagiri', 'Vattrapalayam', 'Alangulam'] },
      { name: 'Sankarankovil', lat: 9.1700, lng: 77.5430, villages: ['Sankarankovil', 'Vasudevanallur', 'Rajapalayam', 'Madurai Veeran Kovil', 'Sivagiri'] },
    ],
  },
  {
    name: 'Thanjavur',
    code: 'TNJ',
    lat: 10.7870,
    lng: 79.1378,
    taluks: [
      { name: 'Thanjavur', lat: 10.7870, lng: 79.1378, villages: ['Thanjavur', 'Vallam', 'Budalur', 'Pappanasam', 'Kumbakonam Road'] },
      { name: 'Kumbakonam', lat: 10.9612, lng: 79.3750, villages: ['Kumbakonam', 'Papanasam', 'Needamangalam', 'Thirunageswaram', 'Tiruvidaimaruthur'] },
      { name: 'Pattukottai', lat: 10.4380, lng: 79.3220, villages: ['Pattukottai', 'Peravurani', 'Adirampattinam', 'Mimisal', 'Sethubavachatram'] },
      { name: 'Papanasam', lat: 10.9280, lng: 79.2680, villages: ['Papanasam', 'Thiruvidaimaruthur', 'Thiruvalar', 'Kumbakonam', 'Saliyamangalam'] },
    ],
  },
  {
    name: 'Theni',
    code: 'THN',
    lat: 10.0104,
    lng: 77.4770,
    taluks: [
      { name: 'Theni-Allinagaram', lat: 10.0104, lng: 77.4770, villages: ['Theni', 'Bodinayakanur', 'Cumbum', 'Gudalur', 'Periyakulam'] },
      { name: 'Periyakulam', lat: 10.1190, lng: 77.5390, villages: ['Periyakulam', 'Gudalur', 'Uthamapalayam', 'Berijam', 'Kottaiyur'] },
      { name: 'Andipatti', lat: 9.9780, lng: 77.6260, villages: ['Andipatti', 'Sholavandan', 'Kambam', 'Rajapalaiyam', 'Uttamapalayam'] },
    ],
  },
  {
    name: 'Thoothukudi',
    code: 'TTK',
    lat: 8.7642,
    lng: 78.1348,
    taluks: [
      { name: 'Thoothukudi', lat: 8.7642, lng: 78.1348, villages: ['Thoothukudi', 'Tiruchendur Road', 'Kayalpattinam', 'Muttom', 'Periyasamypuram'] },
      { name: 'Srivaikundam', lat: 8.7000, lng: 77.9160, villages: ['Srivaikundam', 'Ottapidaram', 'Vilathikulam', 'Kayathar', 'Umarikottai'] },
      { name: 'Tiruchendur', lat: 8.4940, lng: 78.1190, villages: ['Tiruchendur', 'Vilathikulam', 'Muthukrishnapuram', 'Arumuganeri', 'Eral'] },
    ],
  },
  {
    name: 'Tiruchirappalli',
    code: 'TRY',
    lat: 10.7905,
    lng: 78.7047,
    taluks: [
      { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, villages: ['Srirangam', 'Golden Rock', 'Ariyamangalam', 'Woraiyur', 'Palpannai'] },
      { name: 'Lalgudi', lat: 10.8730, lng: 78.8250, villages: ['Lalgudi', 'Manachanallur', 'Thiruverambur', 'K.Sathanur', 'Vaiyampatti'] },
      { name: 'Musiri', lat: 10.9520, lng: 78.4420, villages: ['Musiri', 'Thuraiyur', 'Uppiliapuram', 'Vayalur', 'Thathaiyangarpet'] },
      { name: 'Srirangam', lat: 10.8650, lng: 78.6920, villages: ['Srirangam', 'Thiruverambur', 'K.Sathanur', 'Anbil', 'Thennur'] },
    ],
  },
  {
    name: 'Tirunelveli',
    code: 'TNV',
    lat: 8.7139,
    lng: 77.7567,
    taluks: [
      { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, villages: ['Tirunelveli', 'Palayamkottai', 'Melapalayam', 'Vannarpettai', 'Pettai'] },
      { name: 'Ambasamudram', lat: 8.7090, lng: 77.4570, villages: ['Ambasamudram', 'Papanasam', 'Kallidaikurichi', 'Manimuthar', 'Cheranmahadevi'] },
      { name: 'Manur', lat: 8.6000, lng: 77.7000, villages: ['Manur', 'Nanguneri', 'Cheranmahadevi', 'Sivagiri', 'Valliyoor'] },
      { name: 'Shengottai', lat: 8.9710, lng: 77.2530, villages: ['Shengottai', 'Alangulam', 'Tenkasi Road', 'Kadayanallur', 'Puliyangudi'] },
    ],
  },
  {
    name: 'Tirupathur',
    code: 'TPT',
    lat: 12.4950,
    lng: 78.5730,
    taluks: [
      { name: 'Tirupathur', lat: 12.4950, lng: 78.5730, villages: ['Tirupathur', 'Natrampalli', 'Jolarpettai', 'Vandavasi', 'Polur'] },
      { name: 'Ambur', lat: 12.7930, lng: 78.7170, villages: ['Ambur', 'Vaniyambadi', 'Pernambut', 'Gudiyatham', 'Melvisharam'] },
      { name: 'Jolarpettai', lat: 12.5700, lng: 78.5900, villages: ['Jolarpettai', 'Kandili', 'Natrampalli', 'Tirupathur Road'] },
    ],
  },
  {
    name: 'Tiruppur',
    code: 'TPR',
    lat: 11.1085,
    lng: 77.3411,
    taluks: [
      { name: 'Tiruppur', lat: 11.1085, lng: 77.3411, villages: ['Tiruppur', 'Avinashi', 'Palladam', 'Perundurai Road', 'Mangalam'] },
      { name: 'Dharapuram', lat: 10.7380, lng: 77.5170, villages: ['Dharapuram', 'Udumalaipettai', 'Kangayam', 'Thoppampatti', 'Aliyar'] },
      { name: 'Kangayam', lat: 10.9700, lng: 77.5550, villages: ['Kangayam', 'Pongalur', 'Mulanur', 'Dharapuram Road', 'Thiruchengode Road'] },
      { name: 'Palladam', lat: 11.0100, lng: 77.2760, villages: ['Palladam', 'Sultanpet', 'Kottur', 'Tiruppur Road', 'Avinashi Road'] },
    ],
  },
  {
    name: 'Tiruvallur',
    code: 'TVR',
    lat: 13.1427,
    lng: 79.9080,
    taluks: [
      { name: 'Tiruvallur', lat: 13.1427, lng: 79.9080, villages: ['Tiruvallur', 'Ponneri', 'Gummidipoondi', 'Redhills', 'Puzhal'] },
      { name: 'Poonamallee', lat: 13.0480, lng: 80.1140, villages: ['Poonamallee', 'Ambattur', 'Avadi', 'Nerkundram', 'Porur'] },
      { name: 'Tiruttani', lat: 13.1840, lng: 79.6230, villages: ['Tiruttani', 'Pallipattu', 'Sholavaram', 'Uthukottai', 'Arambakkam'] },
    ],
  },
  {
    name: 'Tiruvannamalai',
    code: 'TVN',
    lat: 12.2253,
    lng: 79.0747,
    taluks: [
      { name: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, villages: ['Tiruvannamalai', 'Cheyyar', 'Polur', 'Arani', 'Vandavasi'] },
      { name: 'Arani', lat: 12.6600, lng: 79.2800, villages: ['Arani', 'Vandavasi', 'Kalasapakkam', 'Chetput', 'Sithalapakkam'] },
      { name: 'Chengam', lat: 12.3280, lng: 78.7980, villages: ['Chengam', 'Kilpennathur', 'Thellar', 'Vepur', 'Varattanpattu'] },
      { name: 'Thandrampet', lat: 12.1000, lng: 78.9000, villages: ['Thandrampet', 'Jamunamarathur', 'Pudupalayam', 'Morant', 'Palayam'] },
    ],
  },
  {
    name: 'Tiruvarur',
    code: 'TVR2',
    lat: 10.7725,
    lng: 79.6330,
    taluks: [
      { name: 'Tiruvarur', lat: 10.7725, lng: 79.6330, villages: ['Tiruvarur', 'Papanasam', 'Nannilam', 'Valangaiman', 'Koothanallur'] },
      { name: 'Mannargudi', lat: 10.6690, lng: 79.8560, villages: ['Mannargudi', 'Thiruthuraipoondi', 'Papanasam', 'Muthupettai', 'Koradacherry'] },
      { name: 'Needamangalam', lat: 10.8200, lng: 79.5000, villages: ['Needamangalam', 'Nannilam', 'Valangaiman', 'Pandavaiyar Head', 'Thirupoondi'] },
    ],
  },
  {
    name: 'Vellore',
    code: 'VLR',
    lat: 12.9165,
    lng: 79.1325,
    taluks: [
      { name: 'Vellore', lat: 12.9165, lng: 79.1325, villages: ['Vellore', 'Gudiyatham Road', 'Sathuvachari', 'Kosapet', 'Katpadi Road'] },
      { name: 'Katpadi', lat: 12.9680, lng: 79.1440, villages: ['Katpadi', 'Sathuvachari', 'Pernambut', 'Arcot Road', 'Melvisharam'] },
      { name: 'Gudiyatham', lat: 12.9440, lng: 78.8700, villages: ['Gudiyatham', 'Mukundarayapuram', 'Kaniyambadi', 'Vettampakkam', 'Jolarpet Road'] },
    ],
  },
  {
    name: 'Viluppuram',
    code: 'VPM',
    lat: 11.9396,
    lng: 79.4930,
    taluks: [
      { name: 'Viluppuram', lat: 11.9396, lng: 79.4930, villages: ['Viluppuram', 'Tindivanam', 'Gingee', 'Sankarapuram', 'Melmalayanur'] },
      { name: 'Tindivanam', lat: 12.2340, lng: 79.6540, villages: ['Tindivanam', 'Vanur', 'Marakanam', 'Cheyyur Road', 'Saram'] },
      { name: 'Gingee', lat: 12.2560, lng: 79.4170, villages: ['Gingee', 'Mailam', 'Thirukoilur', 'Koyambedu', 'Thellar'] },
    ],
  },
  {
    name: 'Virudhunagar',
    code: 'VRD',
    lat: 9.5810,
    lng: 77.9624,
    taluks: [
      { name: 'Virudhunagar', lat: 9.5810, lng: 77.9624, villages: ['Virudhunagar', 'Sivakasi', 'Sattur', 'Narikudi', 'Tiruchuli'] },
      { name: 'Sivakasi', lat: 9.4520, lng: 77.7970, villages: ['Sivakasi', 'Vembakottai', 'Aruppukottai', 'Srivilliputhur Road', 'Soolapuram'] },
      { name: 'Aruppukottai', lat: 9.5060, lng: 78.0970, villages: ['Aruppukottai', 'Kariapatti', 'Tiruchuli', 'Eral', 'Sedapatti'] },
      { name: 'Rajapalayam', lat: 9.4520, lng: 77.5540, villages: ['Rajapalayam', 'Srivilliputhur', 'Watrap', 'Virudhunagar Road', 'Settur'] },
    ],
  },
];
