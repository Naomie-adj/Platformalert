# scraper/scraper.py
import time
import os
import psycopg2

print("🚀 Scraper démarré", flush=True)

# Récupération de la variable d'environnement pour la DB
DATABASE_URL = os.environ.get("DATABASE_URL")

# Connexion à PostgreSQL
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

# Création d'une table test si elle n'existe pas
cursor.execute("""
CREATE TABLE IF NOT EXISTS test_scraper (
    id SERIAL PRIMARY KEY,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
)
""")
conn.commit()

# Boucle principale de scraping
try:
    while True:
        print("🔍 Scraping en cours...", flush=True)
        # Exemple d'insertion dans la DB
        cursor.execute("INSERT INTO test_scraper(message) VALUES (%s)", ("Scraping réussi",))
        conn.commit()
        time.sleep(5)  # attendre 5 secondes
except KeyboardInterrupt:
    print("🛑 Scraper arrêté", flush=True)
finally:
    cursor.close()
    conn.close()
