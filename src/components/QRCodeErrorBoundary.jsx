import { Component } from 'react'

export class QRCodeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="qr-fallback" aria-label="QR code unavailable">
          QR unavailable
        </div>
      )
    }
    return this.props.children
  }
}
