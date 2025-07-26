# 🎮 Axie Game - Web3 Demo

A modern, interactive blockchain game built with Next.js, React, and Web3 technologies. Features a unique betting game with animated blocks, wallet integration, and real-time statistics.

## ✨ Features

- **🎯 Interactive Gameplay**: Click blocks to advance through levels with increasing multipliers
- **💰 Web3 Integration**: Connect MetaMask, Phantom, and other Web3 wallets
- **📊 Real-time Statistics**: Track your game history and leaderboard performance
- **🎨 Modern UI**: Beautiful animations, glassmorphism effects, and responsive design
- **🔊 Sound Effects**: Immersive audio feedback for game events
- **📱 Mobile Responsive**: Optimized for all device sizes
- **🎲 Multiple Game Modes**: Different block layouts and difficulty levels

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Web3 wallet (MetaMask, Phantom, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd axie-game-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

1. **Connect Wallet**: Click the wallet connect button in the top-right corner
2. **Start Game**: Click "Start Game" to begin
3. **Click Blocks**: Click on the blocks to advance through levels
4. **Cash Out**: Click "Cash Out" to secure your winnings
5. **Avoid Bombs**: Don't click on bomb blocks or you'll lose!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Web3**: Wagmi, RainbowKit, Viem
- **Styling**: CSS3, Glassmorphism, Animations
- **Audio**: HTML5 Audio API
- **Deployment**: Vercel, GitHub Pages

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── Game/           # Game logic and UI
│   └── Web3/           # Wallet connection
├── contracts/          # Smart contracts (if applicable)
└── lib/               # Utility functions
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env.local` file for local development:

```bash
# Optional: For Web3 features
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_CHAIN_ID=11155111
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch

### GitHub Pages
1. Build the project: `npm run build`
2. Export static files: `npm run export`
3. Deploy to GitHub Pages

## 🔒 Security

- **Local Game Logic**: Game runs entirely client-side for demo purposes
- **No Real Funds**: Uses testnet tokens only
- **Environment Variables**: Sensitive data stored in environment variables
- **Input Validation**: All user inputs are validated

See [SECURITY.md](./SECURITY.md) for detailed security information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Web3 integration with [Wagmi](https://wagmi.sh/) and [RainbowKit](https://www.rainbowkit.com/)
- Game animations with [Canvas Confetti](https://github.com/catdad/canvas-confetti)

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**⚠️ Disclaimer**: This is a demo project for educational purposes. Do not use real funds or expect production-level security. 