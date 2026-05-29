"use client";

import React from "react";
import { motion } from "framer-motion";
import { TerminalBoot } from "./TerminalBoot";
import { CyberButton } from "@/components/core/CyberButton";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Hero() {
	return (
		<section className="relative min-h-[100dvh] pt-32 pb-20 px-6 md:px-12 flex items-center overflow-hidden">
			{/* Background Grid */}
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDAsMjQzLDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIj48bGluZSB4MT0iMCIgeTE9IjIwIiB4Mj0iNDAiIHkyPSIyMCIvPjxsaW5lIHgxPSIyMCIgeTE9IjAiIHgyPSIyMCIgeTI9IjQwIi8+PC9nPjwvc3ZnPg==')] pointer-events-none" />

			{/* Radial glow */}
			<div className="absolute top-1/2 left-0 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/10 rounded-full blur-[150px] pointer-events-none" />

			<div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">
				{/* Left Column - Copy */}
				<div className="flex flex-col items-start text-left">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
						className="flex items-center gap-2 mb-6 border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-1.5 rounded-sm"
					>
						<ShieldCheck className="w-4 h-4 text-neon-cyan" />
						<span className="text-[11px] font-mono tracking-[0.2em] uppercase text-neon-cyan">
							Autonomous SOC
						</span>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
						className="text-5xl md:text-6xl lg:text-7xl font-outfit font-bold tracking-tighter leading-[1.1] text-white mb-6"
					>
						Defend at <br className="hidden md:block" />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
							God Speed.
						</span>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
						className="text-lg md:text-xl text-text-secondary max-w-[45ch] mb-10 leading-relaxed font-sans"
					>
						An AI-powered autonomous cyber deception system that dynamically
						generates adaptive sandbox environments to trap, study, and
						neutralize attackers before real infrastructure is compromised.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
						className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
					>
						<Link href="/dashboard" className="w-full sm:w-auto">
							<CyberButton
								variant="primary"
								className="w-full sm:w-auto px-8 py-4 text-sm"
								icon={<ArrowRight className="w-4 h-4" />}
							>
								Initialize Sandbox
							</CyberButton>
						</Link>
						<Link href="/architecture" className="w-full sm:w-auto">
							<CyberButton
								variant="ghost"
								className="w-full sm:w-auto px-8 py-4 text-sm"
							>
								Read Architecture
							</CyberButton>
						</Link>
					</motion.div>
				</div>

				{/* Right Column - Terminal Asset */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
					className="w-full h-full lg:min-h-[450px] relative flex items-center justify-center lg:justify-end"
				>
					{/* Decorative elements around terminal */}
					<div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-neon-cyan/20 opacity-50 pointer-events-none -mr-4 -mt-4 hidden lg:block" />
					<div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-neon-magenta/20 opacity-50 pointer-events-none -ml-4 -mb-4 hidden lg:block" />

					<div className="w-full max-w-lg aspect-square lg:aspect-auto lg:h-[450px]">
						<TerminalBoot />
					</div>
				</motion.div>
			</div>
		</section>
	);
}
