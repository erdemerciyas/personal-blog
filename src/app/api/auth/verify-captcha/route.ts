import { NextRequest, NextResponse } from 'next/server';

interface QuestionData {
  question: string;
  answer: number | string;
  type?: 'math' | 'trivia';
  alternatives?: string[];
}

// Rastgele matematik soruları için fonksiyon
function generateMathQuestion(): QuestionData {
  const operations = [
    { 
      type: 'add', 
      generate: () => {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        return { question: `${a} + ${b} = ?`, answer: a + b };
      }
    },
    { 
      type: 'subtract', 
      generate: () => {
        const a = Math.floor(Math.random() * 30) + 10;
        const b = Math.floor(Math.random() * a) + 1;
        return { question: `${a} - ${b} = ?`, answer: a - b };
      }
    },
    { 
      type: 'multiply', 
      generate: () => {
        const a = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 10) + 2;
        return { question: `${a} × ${b} = ?`, answer: a * b };
      }
    }
  ];

  const randomOp = operations[Math.floor(Math.random() * operations.length)];
  return randomOp.generate();
}

// Genel bilgi soruları
const triviaQuestions = [
  { question: "Türkiye'nin başkenti neresidir?", answer: "Ankara", alternatives: ["ankara", "ANKARA"] },
  { question: "1 dakikada kaç saniye vardır?", answer: "60", alternatives: ["altmış", "atmış"] },
  { question: "Güneş sisteminde kaç gezegen vardır?", answer: "8", alternatives: ["sekiz", "SEKIZ"] },
  { question: "İstanbul'un eski adı nedir?", answer: "Konstantinopolis", alternatives: ["konstantinopolis", "istanbul", "bizans"] },
  { question: "Bir yılda kaç ay vardır?", answer: "12", alternatives: ["on iki", "oniki"] },
  { question: "Türkiye'nin en büyük şehri neresidir?", answer: "İstanbul", alternatives: ["istanbul", "ISTANBUL"] },
  { question: "1 + 1 = ?", answer: "2", alternatives: ["iki", "İKİ"] },
  { question: "Dünyanın en büyük okyanusu hangisidir?", answer: "Pasifik", alternatives: ["pasifik", "PASIFIK"] },
  { question: "Bir haftada kaç gün vardır?", answer: "7", alternatives: ["yedi", "YEDİ"] },
  { question: "Türkiye'nin para birimi nedir?", answer: "Türk Lirası", alternatives: ["tl", "lira", "türk lirası", "TÜRK LİRASI"] }
];

function generateTriviaQuestion(): QuestionData {
  const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
  return {
    question: randomQuestion.question,
    answer: randomQuestion.answer,
    alternatives: randomQuestion.alternatives || []
  };
}

// GET: Yeni soru üret
export async function GET() {
  try {
    // %70 matematik, %30 genel bilgi
    const questionType = Math.random() < 0.7 ? 'math' : 'trivia';
    
    let questionData: QuestionData;
    if (questionType === 'math') {
      questionData = generateMathQuestion();
      questionData.type = 'math';
    } else {
      questionData = generateTriviaQuestion();
      questionData.type = 'trivia';
    }

    // Soruyu ve doğru cevabı şifreleyerek hash oluştur
    const questionHash = Buffer.from(JSON.stringify({
      question: questionData.question,
      answer: questionData.answer.toString().toLowerCase(),
      alternatives: questionData.alternatives || [],
      timestamp: Date.now()
    })).toString('base64');

    return NextResponse.json({
      question: questionData.question,
      type: questionData.type,
      hash: questionHash
    });

  } catch (error) {
    console.error('Güvenlik sorusu oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Güvenlik sorusu oluşturulamadı' },
      { status: 500 }
    );
  }
}

// POST: Cevabı doğrula
export async function POST(request: NextRequest) {
  try {
    const { answer, hash } = await request.json();

    if (!answer || !hash) {
      return NextResponse.json(
        { error: 'Cevap ve doğrulama kodu gerekli' },
        { status: 400 }
      );
    }

    // Hash'i çöz
    let questionData: any;
    try {
      const decodedData = Buffer.from(hash, 'base64').toString('utf-8');
      questionData = JSON.parse(decodedData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Geçersiz doğrulama kodu' },
        { status: 400 }
      );
    }

    // Zaman aşımı kontrolü (5 dakika)
    const now = Date.now();
    if (now - questionData.timestamp > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Güvenlik sorusu zaman aşımına uğradı. Yeni soru alın.' },
        { status: 400 }
      );
    }

    // Cevabı kontrol et
    const userAnswer = answer.toString().toLowerCase().trim();
    const correctAnswer = questionData.answer.toLowerCase().trim();
    const alternatives = questionData.alternatives || [];

    const isCorrect = userAnswer === correctAnswer || 
                     alternatives.some((alt: string) => alt.toLowerCase() === userAnswer);

    if (!isCorrect) {
      return NextResponse.json(
        { error: 'Yanlış cevap. Lütfen tekrar deneyin.' },
        { status: 400 }
      );
    }

    // Başarılı doğrulama
    return NextResponse.json({
      success: true,
      message: 'Güvenlik doğrulaması başarılı',
      verificationTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Güvenlik doğrulama hatası:', error);
    return NextResponse.json(
      { error: 'Güvenlik doğrulama sırasında hata oluştu' },
      { status: 500 }
    );
  }
} 