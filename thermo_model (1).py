import math

# Упрощенная таблица термодинамических параметров (dH, dS)
NN_DICT = {
    "AA": (-7.9, -22.2), "TT": (-7.9, -22.2), "AT": (-7.2, -20.4), "TA": (-7.2, -21.3),
    "CA": (-8.5, -22.7), "TG": (-8.5, -22.7), "GT": (-8.4, -22.4), "AC": (-8.4, -22.4),
    "CT": (-7.8, -21.0), "AG": (-7.8, -21.0), "GA": (-8.2, -22.2), "TC": (-8.2, -22.2),
    "CG": (-10.6, -27.2), "GC": (-9.8, -24.4), "GG": (-8.0, -19.9), "CC": (-8.0, -19.9),
}

def calculate_tm_and_curve(sequence: str, c_dna: float = 5e-5):
    # 1. Считаем сумму dH и dS
    dH_total = 0.2  # Инициация
    dS_total = -5.7 # Инициация

    for i in range(len(sequence) - 1):
        pair = sequence[i:i+2]
        if pair in NN_DICT:
            dH_total += NN_DICT[pair][0]
            dS_total += NN_DICT[pair][1]

    dH_total *= 1000  # Перевод в калории
    R = 1.987         # Газовая постоянная

    # 2. Расчет Tm
    tm_kelvin = dH_total / (dS_total + R * math.log(c_dna / 4.0))
    tm_celsius = round(tm_kelvin - 273.15, 2)

    # 3. Генерация кривой (сигмоида плавления)
    curve_points = []
    # k - коэффициент крутизны (чем длиннее цепь, тем резче переход)
    k = min(0.5, len(sequence) * 0.01)

    for temp in range(50, 101, 1): # От 50 до 100 градусов с шагом 1
        # Логистическая функция: доля расплетенных цепей
        fraction = 1.0 / (1.0 + math.exp(-k * (temp - tm_celsius)))
        curve_points.append({"temperature": temp, "fraction_unfolded": round(fraction, 4)})

    return tm_celsius, curve_points
