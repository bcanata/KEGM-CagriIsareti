# KEGM-CagriIsareti

Kıyı Emniyeti Genel Müdürlüğü'nün Çağrı İşareti Sorgulama servisini JSON olarak kullanmanızı sağlar.

1. Repo'yu bilgisayarınıza klonlayın:

   ```bash
   git clone https://github.com/bcanata/KEGM-CagriIsareti.git
   cd KEGM-CagriIsareti

2. Projenin olduğu klasörün içerisine aşağıdaki komutu girerek NPM projesini kurun:
   ```bash
   npm install
   ```

* **.env.sample** dosyasındaki gerekli bilgileri doldurarak adını **.env** olarak değiştirin.
  * Kıyı Emniyeti Genel Müdürlüğü [Çağrı İşareti Sorgulama](https://www.kiyiemniyeti.gov.tr/ehizmetler/telsiz_cagri_isareti_sorgula) servisine kendi bilgileriniz ile giriş yapın. [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg) gibi bir eklenti kullanarak veya Google Chrome Geliştirici Araçları üzerinden **ASP.NET_SessionId** anahtarının değerini bulun.
  * Bulduğunuz değeri **.env** dosyasında SESSIONID değerinin karşısına yazıp kaydedin.

  * QRZ.com üzerinden sorgulamayı kullanmak isterseniz, [QRZ.com XML API](https://www.qrz.com/page/xml_data.html) servisi üzerinden **Session Key** anahtarı oluşturun. 
  * Bulduğunuz değeri **.env** dosyasında QRZ_SESSION_KEY değerinin karşısına yazıp kaydedin.
 
* Projenizi aşağıdaki komutu girerek başlatın:
  ```bash
  npm start
  ```

Projeniz, ayarladığınız port numarası üzerinde aktif olarak çalışmaya başlayacaktır. 

* http://localhost:3000/ ana sayfaya ulaşarak ön yüz üzerinden toplu KEGM, QRZ.com ve TACallbook.com sorgusu yapabilirsiniz.
* http://localhost:3000/kegm/TA1ANW şeklinde sorgulama yaparak KEGM Çağrı İşareti Sorgulama sonuçlarına ulaşabilirsiniz.
* http://localhost:3000/qrz/TA1ANW şeklinde sorgulama yaparak QRZ.com sonuçlarına ulaşabilirsiniz.
* http://localhost:3000/tacb/TA1ANW şeklinde sorgulama yaparak TACallbook.com sonuçlarına ulaşabilirsiniz.
* http://localhost:3000/toplu/TA1ANW şeklinde sorgulama yaparak toplu şekilde KEGM, QRZ.com ve TA Callbook sonuçlarına ulaşabilirsiniz.

## Docker

Paketi Docker üzerine çalıştırmak için şu komutu kullanabilirsiniz:

```bash
docker run -p 3000:3000 -d -e SESSIONID=[Kıyı Emniyeti Session ID] -e QRZ_SESSION_KEY=[QRZ Session Key] bcanata/callsign-search:0.0.2 
```

`[Kıyı Emniyeti Session ID]` ve `[QRZ Session Key]` ibarelerini kendinize ait değerler ile değiştirmeyi unutmayın.

[Docker Hub: bcanata/callsign-search](https://hub.docker.com/r/bcanata/callsign-search)

### Yapılacaklar
- [ ] TA Callbook'tan fotoğraf eklenecek.

### Tamamlananlar ✓
- [x] QRZ.com ve TACallbook.com sorgulama eklendi.
- [x] http://localhost:3000/ adresinden ulaşılan ön yüz eklendi.
- [x] Docker Hub'a Docker paketi hazırlandı.
