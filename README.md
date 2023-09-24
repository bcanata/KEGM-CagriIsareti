# KEGM-CagriIsareti

Kıyı Emniyeti Genel Müdürlüğü'nün Çağrı İşareti Sorgulama servisini JSON olarak kullanmanızı sağlar.

* Projenin olduğu klasörün içerisine aşağıdaki komutu girerek NPM projesini kurun:
  ```
  npm install
  ```

* **.env.sample** dosyasındaki gerekli bilgileri doldurarak adını **.env** olarak değiştirin.
  * Kıyı Emniyeti Genel Müdürlüğü [Çağrı İşareti Sorgulama](https://www.kiyiemniyeti.gov.tr/ehizmetler/telsiz_cagri_isareti_sorgula) servisine kendi bilgileriniz ile giriş yapın. [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg) gibi bir eklenti kullanarak veya Google Chrome Geliştirici Araçları üzerinden **ASP.NET_SessionId** anahtarının değerini bulun.
  * Bulduğunuz değeri **.env** dosyasında SESSIONID değerinin karşısına yazıp kaydedin.
 
* Projenizi aşağıdaki komutu girerek başlatın:
  ```
  npm start
  ```

Projeniz, ayarladığınız port numarası üzerinde aktif olarak çalışmaya başlayacaktır. http://localhost:3000/TA1ANW şeklinde sorgulama yaparak sonuçlara ulaşabilirsiniz.
