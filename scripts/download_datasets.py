import os
import shutil
from huggingface_hub import hf_hub_download, list_repo_files
from tqdm import tqdm

DATASETS = [
    {
        "repo_id": "adi2606/Anime_Characters",
        "category": "anime_characters",
        "name": "Anime Characters",
        "limit": 500
    },
    {
        "repo_id": "prithivMLmods/Realistic-Face-Portrait-1024px",
        "category": "hyperrealistic_faces",
        "name": "Realistic Portraits",
        "limit": 500
    },
    {
        "repo_id": "DamianBoborzi/car_images",
        "category": "sci_fi_vehicles",
        "name": "Sci-Fi Vehicles",
        "limit": 100
    },
    {
        "repo_id": "Remade-AI/Fantasy-Landscapes",
        "category": "fantasy_landscapes",
        "name": "Fantasy Landscapes",
        "limit": 100
    },
    {
        "repo_id": "Codatta/Fashion-1K",
        "category": "fashion_outfits",
        "name": "Fashion Outfits",
        "limit": 100
    }
]

BASE_DIR = os.path.join(os.getcwd(), "dataset")

def setup_directories():
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
    
    for ds in DATASETS:
        cat_dir = os.path.join(BASE_DIR, ds["category"])
        if not os.path.exists(cat_dir):
            os.makedirs(cat_dir)

def download_and_organize():
    print(f"🚀 Initializing High-Performance Dataset Acquisition...")
    print(f"📦 Workspace: {BASE_DIR}\n")

    for ds in DATASETS:
        print(f"📥 Fetching {ds['name']} from HF Hub...")
        
        dest_dir = os.path.join(BASE_DIR, ds["category"])
        
        try:
            # List files in the repo and pick the first N images
            all_files = list_repo_files(repo_id=ds["repo_id"], repo_type="dataset")
            image_files = [f for f in all_files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            
            target_files = image_files[:ds["limit"]]
            file_count = 0

            for file_path in tqdm(target_files, desc=f"   {ds['category']}"):
                try:
                    local_path = hf_hub_download(
                        repo_id=ds["repo_id"],
                        filename=file_path,
                        repo_type="dataset",
                        local_dir=os.path.join(BASE_DIR, "tmp"), # Temporary download spot
                        local_dir_use_symlinks=False
                    )
                    
                    # Move to final location
                    shutil.move(local_path, os.path.join(dest_dir, os.path.basename(file_path)))
                    file_count += 1
                except Exception as e:
                    print(f"   ⚠️ Error downloading {file_path}: {e}")
                    continue
            
            print(f"✅ Finalized {file_count} images for {ds['category']}\n")
        except Exception as e:
            print(f"❌ Failed to process {ds['name']}: {e}\n")

if __name__ == "__main__":
    setup_directories()
    download_and_organize()
    
    # Cleanup tmp if exists
    tmp_dir = os.path.join(BASE_DIR, "tmp")
    if os.path.exists(tmp_dir):
        shutil.rmtree(tmp_dir)
        
    print("✨ Dataset generation complete.")
