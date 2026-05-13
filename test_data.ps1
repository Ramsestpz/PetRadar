$lostPet = @{
    name = "Firulais"
    species = "Perro"
    breed = "Labrador"
    color = "Marrón"
    size = "Grande"
    description = "Perro marrón con mancha blanca en el pecho"
    photo_url = "https://example.com/photo.jpg"
    owner_name = "Juan Pérez"
    owner_email = "juan@example.com"
    owner_phone = "+34 123 456 789"
    address = "Calle Principal 123"
    lat = 40.4168
    lng = -3.7038
    lost_date = "2024-05-12T10:00:00Z"
} | ConvertTo-Json

Write-Host "Creating lost pet..."
$lostResponse = Invoke-WebRequest -Uri http://localhost:3000/lost-pets -Method POST -Body $lostPet -ContentType "application/json"
Write-Host "Lost Pet Response:"
Write-Host $lostResponse.Content

$foundPet = @{
    species = "Perro"
    breed = "Labrador"
    color = "Marrón"
    size = "Grande"
    description = "Perro marrón encontrado en el parque"
    photo_url = "https://example.com/photo2.jpg"
    finder_name = "María García"
    finder_email = "maria@example.com"
    finder_phone = "+34 987 654 321"
    address = "Parque Central"
    lat = 40.4170
    lng = -3.7036
    found_date = "2024-05-12T15:00:00Z"
} | ConvertTo-Json

Write-Host "
Creating found pet..."
$foundResponse = Invoke-WebRequest -Uri http://localhost:3000/found-pets -Method POST -Body $foundPet -ContentType "application/json"
Write-Host "Found Pet Response:"
Write-Host $foundResponse.Content
