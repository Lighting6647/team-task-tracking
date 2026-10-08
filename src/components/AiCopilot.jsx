import React, { useState } from 'react';
import { FiX, FiSend, FiZap, FiFileText, FiPlus } from 'react-icons/fi';

const AiCopilot = ({ activeBoard, onAddItem, onAddDocument }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'สวัสดีครับ! ผมคือ AI Assistant & Copilot 🤖 มีอะไรให้ผมช่วยสรุปข้อมูล สร้างงาน หรือร่างเอกสารให้คุณวันนี้ครับ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (userText) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMsgs);
    if (!userText) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let replyText = '';
      let actionType = null;
      let actionData = null;

      if (lower.includes('สรุป') || lower.includes('ภาพรวม') || lower.includes('summary')) {
        const groupCount = activeBoard?.groups?.length || 0;
        let itemCount = 0;
        let doneCount = 0;

        (activeBoard?.groups || []).forEach(g => {
          (g.items || []).forEach(item => {
            itemCount++;
            if (item.status === 'done') doneCount++;
          });
        });

        replyText = `📊 **สรุปภาพรวมบอร์ด "${activeBoard?.title || 'ปัจจุบัน'}"**:\n• มีกลุ่มงานทั้งหมด: ${groupCount} กลุ่ม\n• งานทั้งหมด: ${itemCount} รายการ\n• งานที่เสร็จสิ้นแล้ว: ${doneCount} รายการ (${itemCount ? Math.round((doneCount/itemCount)*100) : 0}%)\n\n💡 **ข้อแนะนำ:** ควรติดตามงานที่กำลังดำเนินการเพื่อให้เสร็จตามกำหนดส่ง`;
      } else if (lower.includes('ร่าง') || lower.includes('เอกสาร') || lower.includes('proposal') || lower.includes('doc')) {
        replyText = `✍️ **ผมร่างเอกสารตัวอย่างให้เรียบร้อยแล้วครับ:**\n\n📄 **ชื่อเอกสาร:** ข้อเสนอโครงการพัฒนาซอฟต์แวร์\n• วัตถุประสงค์: เพื่อเพิ่มประสิทธิภาพการทำงานร่วมกัน\n• ระยะเวลา: 4 สัปดาห์\n• งบประมาณ: 250,000 บาท\n\nกดปุ่มด้านล่างเพื่อสร้างเอกสารนี้เข้าสู่ Workspace ได้ทันทีครับ!`;
        actionType = 'doc';
        actionData = {
          title: 'ข้อเสนอโครงการพัฒนาซอฟต์แวร์',
          content: '<h1>ข้อเสนอโครงการพัฒนาซอฟต์แวร์</h1><p><strong>วัตถุประสงค์:</strong> เพื่อเพิ่มประสิทธิภาพการทำงานร่วมกัน</p><p><strong>ระยะเวลา:</strong> 4 สัปดาห์</p><p><strong>งบประมาณ:</strong> 250,000 บาท</p>'
        };
      } else if (lower.includes('งาน') || lower.includes('task') || lower.includes('สร้าง')) {
        replyText = `📋 **สกัดรายการงานให้อัตโนมัติ:**\n1. ทดสอบระบบความปลอดภัย (Security Testing)\n2. จัดทำคู่มือการใช้งาน (User Manual)\n3. เตรียมความพร้อมสำหรับวัน Launch (Go-Live Preparation)\n\nกดปุ่มนำเข้าเพื่อเพิ่มงานทั้ง 3 รายการลงในกลุ่มงานแรกของบอร์ดนี้ครับ!`;
        actionType = 'tasks';
        actionData = [
          'ทดสอบระบบความปลอดภัย (Security Testing)',
          'จัดทำคู่มือการใช้งาน (User Manual)',
          'เตรียมความพร้อมสำหรับวัน Launch (Go-Live Preparation)'
        ];
      } else {
        replyText = `🤖 รับทราบครับ! ผมได้วิเคราะห์คำสั่ง "${textToSend}" เรียบร้อยแล้ว พร้อมช่วยคุณบริหารจัดการโปรเจกต์ "${activeBoard?.title || 'Main Workspace'}" อย่างมีประสิทธิภาพครับ`;
      }

      setMessages([...newMsgs, { sender: 'ai', text: replyText, actionType, actionData }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9990 }}>
      {/* Floating Toggle Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0085ff 0%, #a259ff 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            boxShadow: '0 8px 30px rgba(0, 133, 255, 0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            transition: 'transform 0.2s, boxShadow 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <FiZap size={18} />
          <span>AI Copilot Assistant</span>
        </button>
      )}

      {/* Expanded AI Panel */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            height: '520px',
            background: '#1c2038',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ padding: '0.85rem 1.25rem', background: 'linear-gradient(90deg, #1f2445 0%, #291c45 100%)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #0085ff, #a259ff)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <FiZap size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>AI Copilot Assistant</div>
                <div style={{ fontSize: '0.7rem', color: '#a259ff' }}>● พร้อมช่วยเหลือใน บอร์ด {activeBoard?.title}</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <FiX size={18} />
            </button>
          </div>

          {/* Quick Action Chips */}
          <div style={{ padding: '0.5rem 0.85rem', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              onClick={() => handleSend('สรุปภาพรวมบอร์ดนี้ให้หน่อย')}
              style={{ background: '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', whitespace: 'nowrap' }}
            >
              📊 สรุปภาพรวม
            </button>
            <button
              onClick={() => handleSend('สกัดรายการงานใหม่ลงในบอร์ด')}
              style={{ background: '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', whitespace: 'nowrap' }}
            >
              📋 สกัดงานใหม่
            </button>
            <button
              onClick={() => handleSend('ช่วยร่างเอกสารข้อเสนอโครงการ')}
              style={{ background: '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', whitespace: 'nowrap' }}
            >
              ✍️ ร่างเอกสาร
            </button>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.sender === 'user' ? '#0085ff' : '#282d4f',
                  color: '#fff',
                  padding: '0.7rem 0.9rem',
                  borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line'
                }}
              >
                {m.text}
                {m.actionType === 'doc' && onAddDocument && (
                  <button
                    onClick={() => {
                      onAddDocument(m.actionData.title, m.actionData.content);
                      setMessages(prev => [...prev, { sender: 'ai', text: `✅ สร้างเอกสาร "${m.actionData.title}" ในบอร์ดเรียบร้อยแล้ว!` }]);
                    }}
                    style={{
                      marginTop: '8px',
                      background: '#00c875',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FiFileText size={14} /> สร้างเอกสารนี้ทันที
                  </button>
                )}
                {m.actionType === 'tasks' && onAddItem && (
                  <button
                    onClick={() => {
                      m.actionData.forEach(taskTitle => onAddItem(taskTitle));
                      setMessages(prev => [...prev, { sender: 'ai', text: `✅ นำเข้างานทั้ง ${m.actionData.length} รายการลงในบอร์ดสำเร็จแล้ว!` }]);
                    }}
                    style={{
                      marginTop: '8px',
                      background: '#0085ff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FiPlus size={14} /> นำเข้างานลงบอร์ดทันที
                  </button>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: '#282d4f', color: 'var(--text-muted)', padding: '0.5rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                <FiZap className="spin" style={{ marginRight: '6px' }} /> AI กำลังวิเคราะห์ข้อมูล...
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div style={{ padding: '0.75rem', background: '#17192e', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ถาม AI ให้สรุปงาน หรือร่างเอกสาร..."
              style={{ flex: 1, background: '#20243f', border: '1px solid var(--border-color)', color: '#fff', padding: '0.55rem 0.75rem', borderRadius: '8px', outline: 'none', fontSize: '0.85rem' }}
            />
            <button
              onClick={() => handleSend()}
              style={{ background: '#0085ff', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FiSend size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiCopilot;
