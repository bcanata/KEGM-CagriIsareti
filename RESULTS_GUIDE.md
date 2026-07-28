# TA1 Çağrı İşareti Veritabanı Kullanım Kılavuzu

## Genel Bakış

Bu proje, TA1AA'dan TA1ZZ'e kadar tüm Türk amatör telsiz çağrı işaretlerini analiz eden kapsamlı bir veritabanı uygulamasıdır. Uygulama, üç farklı kaynaktan veri toplar ve bunları modern bir web arayüzünde sunar.

## Veri Kaynakları

1. **QRZ.com** - Uluslararası amatör telsiz veritabanı
2. **KEGM** - Kıyı Emniyeti Genel Müdürlüğü (Türkiye resmi kayıtları)
3. **TA Callbook** - Türk amatör telsiz rehberi

## Web Arayüzü

### Ana Sayfa (`http://localhost:3000/`)
- Tekil çağrı işareti sorgulama
- Hızlı arama ve sonuç görüntüleme

### Veritabanı Sayfası (`http://localhost:3000/results`)
Tüm TA1AA-TA1ZZ çağrı işaretlerinin detaylı analizini içerir.

## Özellikler

### 📊 İstatistikler
- **Toplam Çağrı İşareti**: 676 (TA1AA-TA1ZZ)
- **Aktif**: Kullanımda olan çağrı işaretleri
- **Pasif**: Kullanım dışı olan çağrı işaretleri
- **Kayıt Olmayan**: Veritabanında bulunamayanlar

### 🎨 Renk Kodlaması
- **🟢 Yeşil**: Mevcut ve aktif çağrı işaretleri (KEGM'e göre)
- **🟡 Sarı**: Pasif çağrı işaretleri (atamasız veya aktif değil)
- **🔴 Kırmızı**: Kayıtlı olmayan veya geçersiz çağrı işaretleri

### 🔍 Arama ve Filtreleme
- **Metin Araması**: Çağrı işareti, isim veya TCKN ile arama
- **Durum Filtresi**: Mevcut/Pasif/Bulunamadı
- **Kaynak Filtresi**: Sadece QRZ/KEGM/TA Callbook verilerini göster
- **Sıralama**: Çağrı işareti, duruma göre sıralama

### 📄 Veri Gösterimi
Her çağrı işareti için aşağıdaki bilgiler gösterilir:

#### QRZ.com Verileri
- Ad ve soyad
- Konum (adres, şehir, ülke)
- QRZ profili bilgileri

#### KEGM Verileri
- TCKN (gizlenmiş)
- Durum (Aktif/Pasif)
- Geçerlilik tarihi
- Resmi statü bilgisi

#### TA Callbook Verileri
- Ad soyad
- Telefon ve e-posta
- Adres bilgileri
- Web sitesi (varsa)

### 💾 Dışa Aktarma
- CSV formatında veri indirme
- Filtrelenmiş sonuçları dışa aktarma
- Tarih damgalı dosya adları

## API Endpoints

### Bireysel Sorgular
- `GET /qrz/{callsign}` - QRZ.com sorgusu
- `GET /kegm/{callsign}` - KEGM sorgusu
- `GET /tacb/{callsign}` - TA Callbook sorgusu
- `GET /toplu/{callsign}` - Tüm kaynaklardan sorgu

### Toplu İşlemler
- `GET /scan-test` - İlk 10 çağrı işareti için test
- `GET /scan-ta1-range` - Tüm 676 çağrı işaretini tara (~26 dakika)
- `GET /scan-status` - Tarama durumu ve tahmini süre

## Veri Dosyaları

- `response.json` - Tam veritabanı sonuçları
- `public/response.json` - Web arayüzü için erişilebilir kopya

## Güvenlik ve Gizlilik

- TCKN numaraları kısmen maskelenir (`1*********4`)
- Kişisel veriler gizlilik ilkelerine göre işlenir
- Sadece kamu kaynaklarından alınan resmi veriler kullanılır

## Teknik Bilgiler

- **Backend**: Node.js + Express.js
- **Frontend**: Bootstrap 5 + Vanilla JavaScript
- **Veri Formatı**: JSON
- **Sunucu Portu**: 3000
- **Rate Limiting**: Dış servisleri korumak için gecikmeler

## Kullanım İpuçları

1. **Hızlı Arama**: Ana sayfadan tekil çağrı işareti sorgulayın
2. **Genel Bakış**: Veritabanı sayfasından tüm verilere göz atın
3. **İstatistikler**: Sayfanın üstündeki kartlardan genel durumu görün
4. **Detaylı Arama**: Filtreleri kullanarak spesifik sonuçlar bulun
5. **Veri İndirme**: CSV dışa aktarma ile verileri analiz edin

## Sorun Giderme

- Sayfa yüklenmiyorsa: `response.json` dosyasının `public/` klasöründe olduğundan emin olun
- Veriler güncel değil: Yeni tarama çalıştırmak için `/scan-ta1-range` endpoint'ini kullanın
- Arama çalışmıyorsa: Tarayıcı konsolunda hata kontrolü yapın

---

**Not**: Bu uygulama Kıyı Emniyeti Genel Müdürlüğü'nün resmi veri tabanlarını kullanmaktadır ve tüm işlemler yasal sınırlar içinde gerçekleştirilmektedir.