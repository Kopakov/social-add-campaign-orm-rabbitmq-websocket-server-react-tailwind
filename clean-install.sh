#!/bin/bash

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

echo "Dependencies have been cleaned and reinstalled!" 