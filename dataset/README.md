# LoRA Training Dataset: Neuraldrift Curated Stack

This dataset contains 1,300 high-quality images across 5 specialized categories, optimized for training Low-Rank Adaptation (LoRA) models for Stable Diffusion (SD1.5, SDXL, and Flux).

## Included Categories
- 🔥 **Anime Characters** (`/anime_characters`): 500 images
- 👤 **Realistic Portraits** (`/hyperrealistic_faces`): 500 images
- 🚀 **Sci-Fi Vehicles** (`/sci_fi_vehicles`): 100 images
- 🏰 **Fantasy Landscapes** (`/fantasy_landscapes`): 100 images
- 👗 **Fashion Outfits** (`/fashion_outfits`): 100 images

## Training Instructions

### 1. Diffusers / PEFT Compatible (Script-based)
To train using the Hugging Face `diffusers` library:

```bash
export MODEL_NAME="stabilityai/stable-diffusion-xl-base-1.0"
export DATASET_NAME="./dataset/anime_characters"
export OUTPUT_DIR="lora-anime-model"

accelerate launch train_dreambooth_lora_sdxl.py \
  --pretrained_model_name_or_path=$MODEL_NAME \
  --instance_data_dir=$DATASET_NAME \
  --output_dir=$OUTPUT_DIR \
  --mixed_precision="fp16" \
  --instance_prompt="a photo of a character in anime style" \
  --resolution=1024 \
  --train_batch_size=1 \
  --gradient_accumulation_steps=4 \
  --learning_rate=1e-4 \
  --lr_scheduler="constant" \
  --lr_warmup_steps=0 \
  --max_train_steps=500 \
  --validation_prompt="a high quality anime character portrait" \
  --validation_epochs=25 \
  --seed="0"
```

### 2. Kohya_ss / GUI Compatible
If using the **Kohya_ss** GUI:
1. Go to the **LoRA** tab.
2. Under **Training Data**, point the `Image Folder` to the root of your desired category (e.g., `dataset/hyperrealistic_faces`).
3. Set your **Resolution** to `1024,1024` (for the Realistic set) or `512,512` (for the others).
4. Use **Network Rank (Dimension)** 32 or 64 for balanced precision.
5. Under **Advanced Configuration**, ensure "Shuffle Captions" is enabled if you add `.txt` metadata files.

## Metadata Note
The images in this dataset use original filenames. For optimal training results, it is recommended to run a captioning script (like BLIP or WD14) to generate `.txt` files in each folder before starting the training loop.
