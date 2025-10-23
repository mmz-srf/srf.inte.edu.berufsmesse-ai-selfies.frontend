// @ts-ignore
import './FormPage.css';
import { useState } from 'react';
import { FormData } from '../../app/libs/types/FormData';

export default function FormPage() {
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [hairColor, setHairColor] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [color, setColor] = useState<string>('');
    
    const availableColors = ["#30ede9ff", "#6c2672ff", "#acfb94ff", "#ffff5bff"];
    const genders = ['Männlich', 'Weiblich', 'Divers'];

    const handleSubmit = () => {
        // Validate form
        if (!name || !age || !hairColor || !gender || !color) {
            return;
        }

        const formData: FormData = {
            name,
            age: parseInt(age),
            hairColor,
            gender,
            color
        };

        localStorage.setItem('formData', JSON.stringify(formData));
        window.dispatchEvent(new Event('storage'));
    };
    

    return (
        <div className="form-page-container">
            <div className='form-questions'>
                <div className='question'>
                    <label htmlFor="name">Gib hier deinen Charakter-Namen ein.</label>
                    <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        placeholder="z.B. Kim"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className='question'>
                    <label htmlFor="age">Wie alt bist du?</label>
                    <input 
                        type="number" 
                        id="age" 
                        name="age" 
                        placeholder="z.B. 15"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                    />
                </div>
                <div className='question'>
                    <label htmlFor="hairColor">Was ist deine Haarfarbe?</label>
                    <input 
                        type="text" 
                        id="hairColor" 
                        name="hairColor" 
                        placeholder="z.B. Braun"
                        value={hairColor}
                        onChange={(e) => setHairColor(e.target.value)}
                    />
                </div>
                <div className='question'>
                    <label htmlFor="gender">Was ist dein Geschlecht?</label>
                    <div className='genders'>
                        {genders.map((genderOption) => (
                            <div key={genderOption} className='gender-option'>
                                <input
                                    type="radio"
                                    id={genderOption}
                                    name="gender"
                                    value={genderOption}
                                    checked={gender === genderOption}
                                    onChange={(e) => setGender(e.target.value)}
                                />
                                <label htmlFor={genderOption}>{genderOption}</label>
                            </div>
                        ))}
                    </div>
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
                    <button className='next-step-button' onClick={handleSubmit}>
                        Nächster Schritt
                    </button>
                </div>
            </div>
        </div>
    );
}