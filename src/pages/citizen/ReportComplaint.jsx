import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import {
  Sparkle,
  Microphone,
  Stop,
  Camera,
  VideoCamera,
  FileText,
  Trash,
  ArrowsClockwise,
  MapPin,
  Crosshair,
  Brain,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Buildings,
  ShieldCheck,
  Eye,
  X
} from '@phosphor-icons/react';
import Button from '../../components/Button';
import './ReportComplaint.css';

export default function ReportComplaint() {
  const navigate = useNavigate();
  const locationState = useLocation().state || {};
  const { addComplaint, currentUser } = useMockData();

  // 1 to 5 Stepper state
  const [currentStep, setCurrentStep] = useState(locationState.initialStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form payload
  const [formData, setFormData] = useState({
    title: locationState.title || '',
    description: locationState.description || '',
    category: locationState.category || 'Roads & Infrastructure',
    location: locationState.location || 'Anna Nagar 4th Avenue',
    area: 'Anna Nagar West',
    street: '4th Avenue Main Road',
    landmark: 'Opposite Metro Station Pillar 42',
    district: currentUser?.district || 'Chennai',
    priority: 'High'
  });

  // Evidence attachments state
  const [evidenceFiles, setEvidenceFiles] = useState([
    {
      id: 'ev-1',
      name: 'site_photo_01.jpg',
      type: 'photo',
      size: '2.4 MB',
      preview: '📷 Photo'
    }
  ]);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const timerRef = useRef(null);

  // Preview modal for attachments
  const [previewImage, setPreviewImage] = useState(null);

  // AI Analysis Scanner state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Auto-detect multi-issue
  const isMultiIssue = 
    formData.description.toLowerCase().includes('garbage') &&
    formData.description.toLowerCase().includes('streetlight') ||
    formData.description.toLowerCase().includes('drainage') &&
    formData.description.toLowerCase().includes('garbage');

  // Handle voice recording simulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    setVoiceTranscript('');
    timerRef.current = setInterval(() => {
      setRecordSeconds(s => s + 1);
    }, 1000);

    // After 6 seconds auto-complete voice transcription
    setTimeout(() => {
      stopRecording();
      setVoiceTranscript(
        'Broken streetlight and severe garbage accumulation near Anna Nagar 4th cross, causing hazardous traffic at night.'
      );
    }, 5500);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const applyTranscript = () => {
    if (!voiceTranscript) return;
    setFormData(prev => ({
      ...prev,
      title: prev.title || 'Streetlight Failure & Waste Overflow',
      description: voiceTranscript,
      category: 'Multiple Services'
    }));
  };

  // Quick category choices
  const categories = [
    'Roads & Infrastructure',
    'Street Lighting',
    'Sanitation & Waste',
    'Drainage & Water'
  ];

  // File upload handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newEntries = files.map((f, i) => ({
      id: `ev-${Date.now()}-${i}`,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : f.type.startsWith('image') ? 'photo' : 'document',
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      preview: f.type.startsWith('image') ? '📷 Photo' : f.type.startsWith('video') ? '🎥 Video' : '📄 Doc'
    }));

    setEvidenceFiles(prev => [...prev, ...newEntries]);
  };

  const removeEvidence = (id) => {
    setEvidenceFiles(prev => prev.filter(f => f.id !== id));
  };

  // Run AI Core analysis animation when entering Step 4
  useEffect(() => {
    if (currentStep === 4) {
      const t0 = setTimeout(() => {
        setIsAnalyzing(true);
        setAnalysisStep(1);
      }, 0);

      const t1 = setTimeout(() => setAnalysisStep(2), 700);
      const t2 = setTimeout(() => setAnalysisStep(3), 1400);
      const t3 = setTimeout(() => setAnalysisStep(4), 2100);
      const t4 = setTimeout(() => setIsAnalyzing(false), 2700);

      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [currentStep]);

  // Submit Complaint Execution
  const handleSubmitComplaint = () => {
    let complaintPayload;

    if (isMultiIssue) {
      complaintPayload = {
        title: formData.title || 'Multiple Civic Inconveniences',
        description: formData.description,
        location: `${formData.area}, ${formData.street}`,
        district: formData.district,
        priority: 'High',
        evidence: evidenceFiles.map(e => e.name),
        subCases: [
          {
            issue: 'Hazardous Waste Overflow',
            category: 'Sanitation',
            department: 'Sanitation Department',
            priority: 'High',
            expectedResolution: '2 Days'
          },
          {
            issue: 'Streetlight Inoperative Outage',
            category: 'Electrical',
            department: 'Electrical Department',
            priority: 'High',
            expectedResolution: '24 Hours'
          },
          {
            issue: 'Drainage Stagnation',
            category: 'Municipality',
            department: 'Municipal Works',
            priority: 'Medium',
            expectedResolution: '5 Days'
          }
        ]
      };
    } else {
      complaintPayload = {
        title: formData.title || 'Civic Infrastructure Concern',
        description: formData.description,
        category: formData.category,
        department: formData.category.includes('Lighting') ? 'Electrical Department'
          : formData.category.includes('Sanitation') ? 'Sanitation Department'
          : formData.category.includes('Drainage') ? 'Municipal Works'
          : 'Road Infrastructure Dept',
        location: `${formData.area}, ${formData.street}`,
        district: formData.district,
        priority: formData.priority,
        expectedResolution: formData.priority === 'Critical' ? '24 Hours' : '5 Days',
        status: 'In Progress',
        evidence: evidenceFiles.map(e => e.name)
      };
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const createdId = addComplaint(complaintPayload);
      navigate(`/citizen/cases/${createdId}`);
    }, 600);
  };

  return (
    <div className="report-workflow-container">
      {/* ── Workflow Header ── */}
      <div className="report-workflow-header">
        <h2 className="report-header-title">Report a Civic Issue</h2>
        <p className="report-header-subtitle">
          Tell us what needs attention. GovAction AI will identify the issue, responsible department and required action.
        </p>
      </div>

      {/* ── Stepper Navigation ── */}
      <div className="report-stepper-bar">
        {[
          { num: 1, label: '01 Describe' },
          { num: 2, label: '02 Add Evidence' },
          { num: 3, label: '03 Location' },
          { num: 4, label: '04 AI Analysis' },
          { num: 5, label: '05 Review & Submit' }
        ].map((step, idx) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;

          return (
            <React.Fragment key={step.num}>
              <button
                type="button"
                className={`report-step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  // Only allow jumping back or forward if valid title exists
                  if (step.num < currentStep || (formData.title.trim() && formData.description.trim())) {
                    setCurrentStep(step.num);
                  }
                }}
              >
                <div className="report-step-number">
                  {isCompleted ? <Check size={12} weight="bold" /> : step.num}
                </div>
                <span className="report-step-name">{step.label}</span>
              </button>
              {idx < 4 && <div className="report-step-divider" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── STEP 01: DESCRIBE ── */}
      {currentStep === 1 && (
        <div className="report-step-card">
          <div className="report-step-title-group">
            <div>
              <h3 className="report-card-heading">What happened?</h3>
              <p className="report-card-desc">
                Provide clear details about the civic problem. You can type or use the speech assistant.
              </p>
            </div>
            <span className="text-xs font-mono text-primary bg-primary bg-opacity-10 px-2.5 py-1 rounded border border-primary border-opacity-20">
              STEP 1 OF 5
            </span>
          </div>

          {/* Voice Reporting Section */}
          <div className="report-voice-card">
            <div className="report-voice-top">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`voice-mic-trigger ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  title={isRecording ? 'Click to stop recording' : 'Click to speak'}
                >
                  {isRecording ? <Stop size={22} weight="fill" /> : <Microphone size={24} weight="fill" />}
                </button>
                <div>
                  <h4 className="text-sm font-bold text-white m-0">Speak your complaint</h4>
                  <p className="text-xs text-secondary m-0 mt-0.5">
                    {isRecording ? (
                      <span className="text-danger font-bold">● Recording (00:{String(recordSeconds).padStart(2, '0')})</span>
                    ) : (
                      'Tap to speak and let AI generate your summary'
                    )}
                  </p>
                </div>
              </div>

              {/* Simulated Waveform while recording */}
              {isRecording && (
                <div className="voice-waveform-container">
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                </div>
              )}
            </div>

            {/* Transcript Display after recording */}
            {voiceTranscript && (
              <div className="flex flex-col gap-2">
                <div className="voice-transcript-box">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-1">Generated Transcript:</span>
                  "{voiceTranscript}"
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary text-xs"
                    style={{ padding: '0.4rem 0.85rem' }}
                    onClick={applyTranscript}
                  >
                    <Check size={14} weight="bold" />
                    Use Transcript in Form
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary text-xs"
                    style={{ padding: '0.4rem 0.85rem' }}
                    onClick={startRecording}
                  >
                    <ArrowsClockwise size={14} />
                    Record Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="report-form-group">
            <label className="report-form-label">
              <span>Issue Title</span>
              <span className="text-secondary font-normal text-[11px]">Keep it concise</span>
            </label>
            <input
              type="text"
              className="report-input"
              placeholder="e.g. Blocked rainwater drainage causing severe street flooding"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Category Pills */}
          <div className="report-form-group">
            <label className="report-form-label">Primary Classification</label>
            <div className="report-category-grid">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`report-category-btn ${formData.category === cat ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, category: cat })}
                >
                  <Buildings size={16} />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description with Character Counter */}
          <div className="report-form-group">
            <div className="report-form-label">
              <span>Detailed Description</span>
              <span className="report-char-count">{formData.description.length} / 1000 characters</span>
            </div>
            <textarea
              className="report-textarea"
              placeholder="Describe what is broken, hazards involved, duration of the issue, and impact on residents..."
              maxLength={1000}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Footer Controls */}
          <div className="report-controls-footer">
            <button
              type="button"
              className="btn-step-prev"
              onClick={() => navigate('/citizen/home')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-step-next"
              disabled={!formData.title.trim() && !formData.description.trim()}
              onClick={() => {
                if (!formData.title.trim()) {
                  setFormData(prev => ({ ...prev, title: 'Civic Infrastructure Concern' }));
                }
                setCurrentStep(2);
              }}
            >
              Next: Add Evidence
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 02: ADD EVIDENCE ── */}
      {currentStep === 2 && (
        <div className="report-step-card">
          <div className="report-step-title-group">
            <div>
              <h3 className="report-card-heading">Add supporting evidence</h3>
              <p className="report-card-desc">
                Photos, videos, or documents allow officers to dispatch the exact repair equipment immediately.
              </p>
            </div>
            <span className="text-xs font-mono text-primary bg-primary bg-opacity-10 px-2.5 py-1 rounded border border-primary border-opacity-20">
              STEP 2 OF 5
            </span>
          </div>

          {/* Dropzone */}
          <label className="report-dropzone">
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 rounded-full bg-primary bg-opacity-15 text-primary flex items-center justify-center">
              <Camera size={26} weight="fill" />
            </div>
            <div>
              <p className="text-sm font-bold text-white m-0">Click or Drag files to attach evidence</p>
              <p className="text-xs text-secondary m-0 mt-1">Supports High-res Photos (JPG, PNG), Videos (MP4), and Documents</p>
            </div>
            <div className="flex gap-4 text-xs text-primary font-semibold mt-1">
              <span>📷 Photos</span>
              <span>🎥 Videos</span>
              <span>📄 Documents</span>
            </div>
          </label>

          {/* Attached files gallery */}
          <div className="report-form-group">
            <label className="report-form-label">
              <span>Attached Evidence ({evidenceFiles.length})</span>
            </label>

            {evidenceFiles.length === 0 ? (
              <p className="text-xs text-secondary italic">No evidence uploaded yet. You may proceed without attachments.</p>
            ) : (
              <div className="evidence-thumbnails-grid">
                {evidenceFiles.map(file => (
                  <div key={file.id} className="evidence-thumb-card">
                    <div className="evidence-thumb-preview">
                      {file.type === 'photo' && <Camera size={28} />}
                      {file.type === 'video' && <VideoCamera size={28} />}
                      {file.type === 'document' && <FileText size={28} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white m-0 truncate">{file.name}</p>
                      <p className="text-[10px] text-secondary m-0">{file.size}</p>
                    </div>
                    <div className="evidence-thumb-actions">
                      <button
                        type="button"
                        className="evidence-btn-action"
                        onClick={() => setPreviewImage(file.name)}
                      >
                        <Eye size={12} className="inline mr-1" /> Preview
                      </button>
                      <button
                        type="button"
                        className="evidence-btn-action delete"
                        onClick={() => removeEvidence(file.id)}
                      >
                        <Trash size={12} className="inline mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="report-controls-footer">
            <button
              type="button"
              className="btn-step-prev"
              onClick={() => setCurrentStep(1)}
            >
              <ArrowLeft size={16} weight="bold" />
              Back
            </button>
            <button
              type="button"
              className="btn-step-next"
              onClick={() => setCurrentStep(3)}
            >
              Next: Location Details
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 03: LOCATION ── */}
      {currentStep === 3 && (
        <div className="report-step-card">
          <div className="report-step-title-group">
            <div>
              <h3 className="report-card-heading">Where is the issue located?</h3>
              <p className="report-card-desc">
                Pinpoint the civic spot so the nearest operational zone team can be mobilized.
              </p>
            </div>
            <span className="text-xs font-mono text-primary bg-primary bg-opacity-10 px-2.5 py-1 rounded border border-primary border-opacity-20">
              STEP 3 OF 5
            </span>
          </div>

          <div className="report-location-grid">
            {/* Input fields */}
            <div className="flex flex-col gap-4">
              <div className="report-form-group">
                <label className="report-form-label">Area / Ward</label>
                <input
                  type="text"
                  className="report-input"
                  placeholder="e.g. Anna Nagar West"
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: e.target.value })}
                />
              </div>

              <div className="report-form-group">
                <label className="report-form-label">Street Name / Cross</label>
                <input
                  type="text"
                  className="report-input"
                  placeholder="e.g. 4th Avenue Main Road"
                  value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div className="report-form-group">
                <label className="report-form-label">Prominent Landmark</label>
                <input
                  type="text"
                  className="report-input"
                  placeholder="e.g. Opposite Metro Pillar 42"
                  value={formData.landmark}
                  onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                />
              </div>

              <div className="report-form-group">
                <label className="report-form-label">District Jurisdiction</label>
                <input
                  type="text"
                  className="report-input"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            {/* Visual Mock Radar Map Panel */}
            <div className="mock-map-panel">
              <div className="mock-map-grid-bg" />

              <div className="flex justify-between items-center z-10">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-primary bg-bg-main bg-opacity-80 px-2 py-1 rounded border border-primary border-opacity-30">
                  <Crosshair size={14} />
                  GPS RADAR MATRIX
                </div>
                <button
                  type="button"
                  className="btn btn-primary text-xs"
                  style={{ padding: '0.35rem 0.75rem' }}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      area: 'Anna Nagar West',
                      street: '2nd Main Avenue',
                      landmark: 'Near Roundtana Tower'
                    }));
                  }}
                >
                  <MapPin size={14} weight="fill" />
                  Use Current Location
                </button>
              </div>

              {/* Reticle Target */}
              <div className="mock-map-reticle">
                <div className="reticle-ring">
                  <div className="reticle-pin" />
                </div>
                <div className="mt-2 text-center bg-bg-main bg-opacity-90 px-2.5 py-1 rounded border border-primary border-opacity-40 shadow-lg">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary block">● Reported Location</span>
                  <span className="text-xs font-bold text-white">{formData.area || 'Anna Nagar'}</span>
                </div>
              </div>

              <div className="z-10 bg-bg-main bg-opacity-80 p-2 rounded border border-gray-100 border-opacity-10 text-[11px] text-secondary flex justify-between">
                <span>Lat: 13.0850° N</span>
                <span>Long: 80.2101° E</span>
                <span className="text-success font-semibold">Zone 08 Connected</span>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="report-controls-footer">
            <button
              type="button"
              className="btn-step-prev"
              onClick={() => setCurrentStep(2)}
            >
              <ArrowLeft size={16} weight="bold" />
              Back
            </button>
            <button
              type="button"
              className="btn-step-next"
              onClick={() => setCurrentStep(4)}
            >
              Analyze with GovAction AI
              <Brain size={18} weight="fill" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 04: AI ANALYSIS ── */}
      {currentStep === 4 && (
        <div className="report-step-card">
          <div className="report-step-title-group">
            <div>
              <h3 className="report-card-heading">GovAction AI Diagnostic Core</h3>
              <p className="report-card-desc">
                Autonomous classification, department routing, urgency estimation, and multi-ticket split.
              </p>
            </div>
            <span className="text-xs font-mono text-primary bg-primary bg-opacity-10 px-2.5 py-1 rounded border border-primary border-opacity-20">
              STEP 4 OF 5
            </span>
          </div>

          {isAnalyzing ? (
            <div className="ai-scan-in-progress">
              <div className="ai-core-spinner">
                <Brain size={38} className="text-primary animate-pulse" weight="fill" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white m-0">AI is analyzing your report</h4>
                <p className="text-xs text-secondary m-0 mt-1">Cross-referencing municipal operational protocols</p>
              </div>

              <div className="ai-scan-step-list">
                <div className={`ai-scan-step-item ${analysisStep >= 1 ? 'text-primary' : 'text-secondary opacity-40'}`}>
                  {analysisStep > 1 ? <Check size={14} className="text-success" /> : <Sparkle size={14} />}
                  <span>Identifying issue signature...</span>
                </div>
                <div className={`ai-scan-step-item ${analysisStep >= 2 ? 'text-primary' : 'text-secondary opacity-40'}`}>
                  {analysisStep > 2 ? <Check size={14} className="text-success" /> : <Sparkle size={14} />}
                  <span>Detecting location & zone boundaries...</span>
                </div>
                <div className={`ai-scan-step-item ${analysisStep >= 3 ? 'text-primary' : 'text-secondary opacity-40'}`}>
                  {analysisStep > 3 ? <Check size={14} className="text-success" /> : <Sparkle size={14} />}
                  <span>Determining responsible department...</span>
                </div>
                <div className={`ai-scan-step-item ${analysisStep >= 4 ? 'text-primary' : 'text-secondary opacity-40'}`}>
                  {analysisStep >= 4 ? <Check size={14} className="text-success" /> : <Sparkle size={14} />}
                  <span>Estimating urgency & calculating risk vector...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="ai-analysis-screen">
              {/* Premium AI Result Panel */}
              <div className="ai-result-panel">
                <div className="ai-result-header">
                  <div className="ai-result-badge">
                    <Sparkle size={16} weight="fill" />
                    ✦ AI CIVIC ANALYSIS REPORT
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-secondary">Confidence:</span>
                    <span className="text-xs font-mono font-bold text-success">94%</span>
                  </div>
                </div>

                {/* Primary Metrics Grid */}
                <div className="ai-metrics-grid">
                  <div className="ai-metric-cell">
                    <p className="ai-metric-label">Detected Issue</p>
                    <p className="ai-metric-value text-primary">
                      {isMultiIssue ? 'Multi-Hazard Cluster' : 'Blocked Drainage / Waterlogging'}
                    </p>
                  </div>
                  <div className="ai-metric-cell">
                    <p className="ai-metric-label">Suggested Department</p>
                    <p className="ai-metric-value">
                      {isMultiIssue ? 'Multi-Department' : 'Municipality Works'}
                    </p>
                  </div>
                  <div className="ai-metric-cell">
                    <p className="ai-metric-label">Priority & SLA</p>
                    <p className="ai-metric-value text-warning">HIGH (7 Days SLA)</p>
                  </div>
                  <div className="ai-metric-cell">
                    <p className="ai-metric-label">Risk Vector</p>
                    <p className="ai-metric-value text-critical font-mono">72 / 100 — HIGH</p>
                  </div>
                </div>

                {/* Multi-Issue Splitting Card if detected */}
                {isMultiIssue && (
                  <div className="ai-multi-split-box">
                    <div className="flex items-center gap-2 text-warning font-bold text-xs uppercase tracking-wider">
                      <WarningCircle size={18} weight="fill" />
                      Multi-Issue Detected: Auto-Splitting Operational Tickets
                    </div>
                    <p className="text-xs text-secondary mt-1 mb-0">
                      Your description involves multiple distinct infrastructure domains. GovAction AI has scheduled 3 independent departmental action tickets to ensure dedicated officer accountability:
                    </p>
                    <div className="ai-split-tickets-grid">
                      <div className="ai-sub-ticket-card">
                        <span className="text-[10px] font-mono text-primary block mb-1">SUB-TICKET A</span>
                        <p className="text-xs font-bold text-white m-0">Sanitation Dept</p>
                        <p className="text-[11px] text-secondary m-0 mt-0.5">Garbage Clearance</p>
                      </div>
                      <div className="ai-sub-ticket-card">
                        <span className="text-[10px] font-mono text-primary block mb-1">SUB-TICKET B</span>
                        <p className="text-xs font-bold text-white m-0">Electrical Dept</p>
                        <p className="text-[11px] text-secondary m-0 mt-0.5">Streetlight Repair</p>
                      </div>
                      <div className="ai-sub-ticket-card">
                        <span className="text-[10px] font-mono text-primary block mb-1">SUB-TICKET C</span>
                        <p className="text-xs font-bold text-white m-0">Municipal Works</p>
                        <p className="text-[11px] text-secondary m-0 mt-0.5">Drainage Obstruction</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Action Summary */}
                <div className="p-3.5 rounded-lg bg-bg-main bg-opacity-70 border border-gray-100 border-opacity-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Prescribed Action</p>
                  <p className="text-xs text-text-primary m-0 leading-relaxed font-mono">
                    Inspect physical site, clear drainage blockage, restore electrical illumination, and dispatch municipal sanitation truck within SLA window.
                  </p>
                </div>

                {/* Why Explanation Breakdown */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">Why this classification?</h5>
                  <div className="ai-why-checklist">
                    <div className="ai-why-item">
                      <CheckCircle size={14} className="text-primary" weight="fill" />
                      <span>Public infrastructure impact identified</span>
                    </div>
                    <div className="ai-why-item">
                      <CheckCircle size={14} className="text-primary" weight="fill" />
                      <span>Waterlogging and stagnation reported</span>
                    </div>
                    <div className="ai-why-item">
                      <CheckCircle size={14} className="text-primary" weight="fill" />
                      <span>Location specific to Zone 08 jurisdiction</span>
                    </div>
                    <div className="ai-why-item">
                      <CheckCircle size={14} className="text-primary" weight="fill" />
                      <span>Potential public safety hazard evaluated</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="report-controls-footer">
                <button
                  type="button"
                  className="btn-step-prev"
                  onClick={() => setCurrentStep(3)}
                >
                  <ArrowLeft size={16} weight="bold" />
                  Modify Location
                </button>
                <button
                  type="button"
                  className="btn-step-next"
                  onClick={() => setCurrentStep(5)}
                >
                  Review & Submit
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 05: REVIEW & SUBMIT ── */}
      {currentStep === 5 && (
        <div className="report-step-card">
          <div className="report-step-title-group">
            <div>
              <h3 className="report-card-heading">Review & Confirm Submission</h3>
              <p className="report-card-desc">
                Review the compiled grievance package before final cryptographic routing.
              </p>
            </div>
            <span className="text-xs font-mono text-primary bg-primary bg-opacity-10 px-2.5 py-1 rounded border border-primary border-opacity-20">
              STEP 5 OF 5
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Title & Description Box */}
            <div className="p-4 rounded-lg bg-bg-main border border-gray-100 border-opacity-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Complaint Title</span>
              <h4 className="text-base font-bold text-white m-0 mb-2">{formData.title}</h4>
              <p className="text-xs text-text-primary m-0 font-mono leading-relaxed opacity-90">
                {formData.description}
              </p>
            </div>

            {/* Metadata Summary Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-bg-main border border-gray-100 border-opacity-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Target Location</span>
                <p className="text-xs font-bold text-white m-0">{formData.area}, {formData.street}</p>
                <p className="text-[10px] text-secondary m-0 mt-0.5">{formData.landmark}</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-main border border-gray-100 border-opacity-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Department Routing</span>
                <p className="text-xs font-bold text-primary m-0">
                  {isMultiIssue ? 'Multi-Department Split' : formData.category}
                </p>
                <p className="text-[10px] text-secondary m-0 mt-0.5">{formData.district} District</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-main border border-gray-100 border-opacity-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Evidence Attached</span>
                <p className="text-xs font-bold text-white m-0">{evidenceFiles.length} item(s)</p>
                <p className="text-[10px] text-success m-0 mt-0.5 font-bold">Metadata Verified</p>
              </div>
            </div>

            {/* Assurance Banner */}
            <div className="p-3 rounded-lg bg-success bg-opacity-10 border border-success border-opacity-25 flex items-center gap-3">
              <ShieldCheck size={24} className="text-success flex-shrink-0" weight="fill" />
              <div className="text-xs text-text-primary">
                <strong>Enforceable SLA Guarantee:</strong> Once submitted, this grievance enters the official district audit register. The assigned officer must submit photographic proof upon completion.
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="report-controls-footer">
            <button
              type="button"
              className="civic-btn civic-btn-ghost civic-btn-md btn-back"
              onClick={() => setCurrentStep(4)}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} weight="bold" />
              Back to AI Diagnostics
            </button>
            <Button
              size="md"
              variant="primary"
              loading={isSubmitting}
              loadingText="Submitting..."
              onClick={handleSubmitComplaint}
            >
              <CheckCircle size={18} weight="fill" />
              Confirm & Execute Dispatch
            </Button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="citizen-modal-backdrop" onClick={() => setPreviewImage(null)}>
          <div className="citizen-modal-box" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 border-opacity-10 flex justify-between items-center bg-bg-surface">
              <h4 className="m-0 text-sm font-bold text-white">{previewImage}</h4>
              <button
                type="button"
                className="bg-transparent border-none text-secondary hover:text-white cursor-pointer"
                onClick={() => setPreviewImage(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-8 text-center bg-bg-main">
              <Camera size={64} className="text-primary mx-auto mb-3 opacity-60" />
              <p className="text-xs text-secondary m-0">Evidence preview stored in browser session memory.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
