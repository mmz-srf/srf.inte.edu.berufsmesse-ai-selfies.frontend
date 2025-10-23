// @ts-ignore
import './FormPage.css';
import { useState } from 'react';

export default function FormPage() {
    const [color, setColor] = useState<string>('');
    const availableColors = ["#30ede9ff", "#6c2672ff", "#acfb94ff", "#ffff5bff"];
    

    return (
        <div className="form-page-container">
            <div className='form-questions'>
                <div className='question'>
                    <label htmlFor="name">Gib hier deinen Charakter-Namen ein.</label>
                    <input type="text" id="name" name="name" placeholder="z.B. Kim"/>
                </div>
                <div className='question'>
                    <label htmlFor="age">Wie alt bist du?</label>
                    <input type="number" id="age" name="age" placeholder="z.B. 15"/>
                </div>
                <div className='question'>
                    <label htmlFor="hairColor">Was ist deine Haarfarbe?</label>
                    <input type="text" id="hairColor" name="hairColor" placeholder="z.B. Braun"/>
                </div>
                <div className='question genders'>
                    <label htmlFor="gender">Was ist dein Geschlecht?</label>
                    <div className='genders'></div>
                </div>
                <div className='question'>
                    <label htmlFor="color">Wähle eine farbe.</label>
                    <div className='color-options'>
                        {availableColors.map((col) => (
                            <div
                                key={col}
                                className={`color-option ${color === col ? 'selected' : ''}`}
                                style={{ backgroundColor: col }}
                                onClick={() => setColor(col)}
                            />
                        ))}
                    </div>
                </div>
                <div className='next-step-button-container'>
                    <button className='next-step-button'>Nächster Schritt</button>
                </div>
            </div>
        </div>
    );
}