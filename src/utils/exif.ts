// EXIF情報からGPS位置情報を抽出するユーティリティ

export interface GPSLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface EXIFData {
  location?: GPSLocation;
  timestamp?: Date;
  camera?: string;
  orientation?: number;
}

/**
 * ファイルからEXIF情報を抽出
 */
export async function extractEXIFData(file: File): Promise<EXIFData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const dataView = new DataView(arrayBuffer);
        
        // JPEG形式チェック
        if (dataView.getUint16(0) !== 0xFFD8) {
          resolve({}); // JPEG以外の場合は空のオブジェクトを返す
          return;
        }
        
        const exifData = parseEXIF(dataView);
        resolve(exifData);
      } catch (error) {
        console.warn('EXIF parsing error:', error);
        resolve({}); // エラーの場合は空のオブジェクトを返す
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file.slice(0, 65536)); // 最初の64KBのみ読み取り（EXIFは通常先頭に含まれる）
  });
}

/**
 * DataViewからEXIF情報を解析
 */
function parseEXIF(dataView: DataView): EXIFData {
  let offset = 2; // SOI (0xFFD8) をスキップ
  const exifData: EXIFData = {};
  
  // APPセグメントを探す
  while (offset < dataView.byteLength - 4) {
    const marker = dataView.getUint16(offset);
    
    if (marker === 0xFFE1) { // APP1 (EXIF)
      const length = dataView.getUint16(offset + 2);
      const exifIdentifier = getString(dataView, offset + 4, 4);
      
      if (exifIdentifier === 'Exif') {
        const tiffOffset = offset + 10;
        const ifdData = parseTIFF(dataView, tiffOffset);
        Object.assign(exifData, ifdData);
      }
      
      offset += length + 2;
    } else if ((marker & 0xFF00) === 0xFF00) {
      // 他のマーカー
      const length = dataView.getUint16(offset + 2);
      offset += length + 2;
    } else {
      break;
    }
  }
  
  return exifData;
}

/**
 * TIFF形式のIFDを解析
 */
function parseTIFF(dataView: DataView, offset: number): EXIFData {
  const exifData: EXIFData = {};
  
  try {
    // バイトオーダーを確認
    const byteOrder = dataView.getUint16(offset);
    const isLittleEndian = byteOrder === 0x4949;
    
    // TIFF識別子をチェック
    const tiffId = getUint16(dataView, offset + 2, isLittleEndian);
    if (tiffId !== 42) return exifData;
    
    // 最初のIFDオフセット
    let ifdOffset = getUint32(dataView, offset + 4, isLittleEndian);
    
    // IFDを解析
    while (ifdOffset !== 0) {
      const ifdData = parseIFD(dataView, offset + ifdOffset, isLittleEndian, offset);
      Object.assign(exifData, ifdData);
      
      // 次のIFDオフセット
      const entryCount = getUint16(dataView, offset + ifdOffset, isLittleEndian);
      const nextIFDOffset = offset + ifdOffset + 2 + (entryCount * 12);
      
      if (nextIFDOffset + 4 <= dataView.byteLength) {
        ifdOffset = getUint32(dataView, nextIFDOffset, isLittleEndian);
      } else {
        break;
      }
    }
  } catch (error) {
    console.warn('TIFF parsing error:', error);
  }
  
  return exifData;
}

/**
 * IFD（Image File Directory）を解析
 */
function parseIFD(dataView: DataView, ifdOffset: number, isLittleEndian: boolean, tiffOffset: number): EXIFData {
  const exifData: EXIFData = {};
  
  try {
    const entryCount = getUint16(dataView, ifdOffset, isLittleEndian);
    
    for (let i = 0; i < entryCount; i++) {
      const entryOffset = ifdOffset + 2 + (i * 12);
      const tag = getUint16(dataView, entryOffset, isLittleEndian);
      const type = getUint16(dataView, entryOffset + 2, isLittleEndian);
      const count = getUint32(dataView, entryOffset + 4, isLittleEndian);
      const valueOffset = getUint32(dataView, entryOffset + 8, isLittleEndian);
      
      // GPS情報のタグを処理
      if (tag === 0x8825) { // GPS IFD Pointer
        const gpsIfdOffset = tiffOffset + valueOffset;
        const gpsData = parseGPSIFD(dataView, gpsIfdOffset, isLittleEndian, tiffOffset);
        if (gpsData.location) {
          exifData.location = gpsData.location;
        }
      }
      
      // 撮影日時
      if (tag === 0x0132 || tag === 0x9003 || tag === 0x9004) { // DateTime, DateTimeOriginal, DateTimeDigitized
        try {
          const dateTimeString = getStringFromValue(dataView, entryOffset + 8, count, type, valueOffset, tiffOffset, isLittleEndian);
          if (dateTimeString) {
            const parsedDate = parseDateTimeString(dateTimeString);
            if (parsedDate) {
              exifData.timestamp = parsedDate;
            }
          }
        } catch (e) {
          // 日時の解析に失敗した場合は無視
        }
      }
    }
  } catch (error) {
    console.warn('IFD parsing error:', error);
  }
  
  return exifData;
}

/**
 * GPS IFDを解析
 */
function parseGPSIFD(dataView: DataView, gpsOffset: number, isLittleEndian: boolean, tiffOffset: number): EXIFData {
  const gpsData: { lat?: number; lng?: number } = {};
  
  try {
    const entryCount = getUint16(dataView, gpsOffset, isLittleEndian);
    
    let latRef = '';
    let lngRef = '';
    
    for (let i = 0; i < entryCount; i++) {
      const entryOffset = gpsOffset + 2 + (i * 12);
      const tag = getUint16(dataView, entryOffset, isLittleEndian);
      const type = getUint16(dataView, entryOffset + 2, isLittleEndian);
      const count = getUint32(dataView, entryOffset + 4, isLittleEndian);
      const valueOffset = getUint32(dataView, entryOffset + 8, isLittleEndian);
      
      switch (tag) {
        case 1: // GPSLatitudeRef
          latRef = getString(dataView, entryOffset + 8, 1);
          break;
        case 2: // GPSLatitude
          if (type === 5 && count === 3) { // RATIONAL
            const lat = parseGPSCoordinate(dataView, tiffOffset + valueOffset, isLittleEndian);
            if (lat !== null) gpsData.lat = lat;
          }
          break;
        case 3: // GPSLongitudeRef
          lngRef = getString(dataView, entryOffset + 8, 1);
          break;
        case 4: // GPSLongitude
          if (type === 5 && count === 3) { // RATIONAL
            const lng = parseGPSCoordinate(dataView, tiffOffset + valueOffset, isLittleEndian);
            if (lng !== null) gpsData.lng = lng;
          }
          break;
      }
    }
    
    // 座標値の符号を調整
    if (gpsData.lat !== undefined && gpsData.lng !== undefined) {
      if (latRef === 'S') gpsData.lat = -gpsData.lat;
      if (lngRef === 'W') gpsData.lng = -gpsData.lng;
      
      return {
        location: {
          lat: gpsData.lat,
          lng: gpsData.lng
        }
      };
    }
  } catch (error) {
    console.warn('GPS IFD parsing error:', error);
  }
  
  return {};
}

/**
 * GPS座標（度・分・秒）を十進度に変換
 */
function parseGPSCoordinate(dataView: DataView, offset: number, isLittleEndian: boolean): number | null {
  try {
    // 度
    const degrees = getRational(dataView, offset, isLittleEndian);
    // 分
    const minutes = getRational(dataView, offset + 8, isLittleEndian);
    // 秒
    const seconds = getRational(dataView, offset + 16, isLittleEndian);
    
    if (degrees !== null && minutes !== null && seconds !== null) {
      return degrees + (minutes / 60) + (seconds / 3600);
    }
  } catch (error) {
    console.warn('GPS coordinate parsing error:', error);
  }
  
  return null;
}

/**
 * RATIONAL型の値を読み取り
 */
function getRational(dataView: DataView, offset: number, isLittleEndian: boolean): number | null {
  try {
    const numerator = getUint32(dataView, offset, isLittleEndian);
    const denominator = getUint32(dataView, offset + 4, isLittleEndian);
    
    return denominator !== 0 ? numerator / denominator : null;
  } catch (error) {
    return null;
  }
}

/**
 * エンディアンを考慮したUint16読み取り
 */
function getUint16(dataView: DataView, offset: number, isLittleEndian: boolean): number {
  return dataView.getUint16(offset, isLittleEndian);
}

/**
 * エンディアンを考慮したUint32読み取り
 */
function getUint32(dataView: DataView, offset: number, isLittleEndian: boolean): number {
  return dataView.getUint32(offset, isLittleEndian);
}

/**
 * 文字列を読み取り
 */
function getString(dataView: DataView, offset: number, length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const char = dataView.getUint8(offset + i);
    if (char === 0) break;
    result += String.fromCharCode(char);
  }
  return result;
}

/**
 * 値から文字列を取得
 */
function getStringFromValue(dataView: DataView, valueOffset: number, count: number, type: number, offset: number, tiffOffset: number, _isLittleEndian: boolean): string | null {
  try {
    if (type === 2 && count <= 4) { // ASCII, 4bytes以下
      return getString(dataView, valueOffset, count - 1); // null終端を除く
    } else if (type === 2 && count > 4) { // ASCII, 4bytesより大きい
      return getString(dataView, tiffOffset + offset, count - 1);
    }
  } catch (error) {
    console.warn('String parsing error:', error);
  }
  return null;
}

/**
 * 日時文字列をDateオブジェクトに変換
 */
function parseDateTimeString(dateTimeString: string): Date | null {
  try {
    // "YYYY:MM:DD HH:MM:SS" 形式
    const match = dateTimeString.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
    }
  } catch (error) {
    console.warn('DateTime parsing error:', error);
  }
  return null;
}

/**
 * 2つの座標間の距離を計算（メートル単位）
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 地球の半径（メートル）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 最も近い場所を見つける
 */
export function findNearestPlace(photoLocation: GPSLocation, places: Array<{ id: string; name: string; lat: number; lng: number }>, maxDistance: number = 200): { place: any; distance: number } | null {
  let nearestPlace = null;
  let minDistance = Infinity;
  
  for (const place of places) {
    const distance = calculateDistance(photoLocation.lat, photoLocation.lng, place.lat, place.lng);
    
    if (distance <= maxDistance && distance < minDistance) {
      minDistance = distance;
      nearestPlace = place;
    }
  }
  
  return nearestPlace ? { place: nearestPlace, distance: minDistance } : null;
}